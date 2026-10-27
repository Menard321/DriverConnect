'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneCall, PhoneOff, Volume2, Sparkles, X, ChevronRight, Check } from 'lucide-react';
import { formatTZS, calculateRentalQuote } from '@/lib/formatters';
import { Vehicle } from '@/lib/types';
import { INITIAL_VEHICLES } from '@/lib/mockData';
import { EmbeddedCheckoutModal } from '@/components/checkout/EmbeddedCheckoutModal';

interface VoiceConciergeProps {
  onFilterVehicles?: (vehicles: Vehicle[]) => void;
}

export const VoiceConcierge: React.FC<VoiceConciergeProps> = ({ onFilterVehicles }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [statusText, setStatusText] = useState('Ava is ready to assist you in TZS');
  const [transcript, setTranscript] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [activeCards, setActiveCards] = useState<Vehicle[]>([]);

  // Checkout modal state triggered via voice
  const [checkoutData, setCheckoutData] = useState<{
    isOpen: boolean;
    vehicleTitle: string;
    totalAmountTZS: number;
    bookingType: string;
    vehicleId?: string;
  }>({
    isOpen: false,
    vehicleTitle: '',
    totalAmountTZS: 0,
    bookingType: 'rental',
  });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize remote audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audio.autoplay = true;
      remoteAudioRef.current = audio;
    }

    return () => {
      endCall();
    };
  }, []);

  // Listen for external trigger events (e.g. from HeaderMegaMenu "Talk to Ava" button)
  useEffect(() => {
    const handleExternalTrigger = () => {
      setIsOpen(true);
      if (!isCalling) {
        startVoiceCall();
      }
    };

    window.addEventListener('trigger-voice-concierge', handleExternalTrigger);
    return () => {
      window.removeEventListener('trigger-voice-concierge', handleExternalTrigger);
    };
  }, [isCalling]);

  const startVoiceCall = async () => {
    setIsCalling(true);
    setStatusText('Connecting to Ava via WebRTC...');

    try {
      // 1. Fetch ephemeral session token from /api/session
      const sessionRes = await fetch('/api/session', { method: 'POST' });
      const sessionData = await sessionRes.json();

      if (sessionData.mock) {
        // Fallback simulated voice loop if no OpenAI key is set
        setupSimulatedVoiceLoop();
        return;
      }

      const EPHEMERAL_KEY = sessionData.client_secret.value;

      // 2. Instantiate RTCPeerConnection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // 3. Play remote audio via HTML Audio element
      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      // 4. Capture local audio microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // 5. Create DataChannel named 'oai-events'
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.onopen = () => {
        setStatusText('Ava is listening. Ask for car rentals, pricing, or bookings in TZS...');
      };

      dc.onmessage = (e) => {
        handleDataChannelMessage(e.data);
      };

      // 6. Create SDP Offer & negotiate with OpenAI Realtime API
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`SDP Answer failed: ${sdpResponse.statusText}`);
      }

      const answerSdp = await sdpResponse.text();
      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: answerSdp,
      };

      await pc.setRemoteDescription(answer);
      setStatusText('Connected. Ava is speaking.');
    } catch (err: any) {
      console.warn('[WebRTC Connection Notice - falling back to simulated conversational mode]:', err);
      setupSimulatedVoiceLoop();
    }
  };

  const setupSimulatedVoiceLoop = () => {
    setStatusText('Connected to Ava (Automated Voice Assistant in TZS)');
    setTranscript((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'Jambo! I am Ava, your DriverConnect concierge. Are you looking to rent a luxury 4x4, purchase a verified vehicle, or schedule a workshop service in Dar es Salaam?',
      },
    ]);
  };

  const handleDataChannelMessage = (rawMessage: string) => {
    try {
      const event = JSON.parse(rawMessage);

      // Handle function call execution requests
      if (event.type === 'response.function_call_arguments.done') {
        const { name, call_id, arguments: argsJson } = event;
        const args = JSON.parse(argsJson);
        executeClientTool(name, call_id, args);
      }

      // Handle transcript streaming
      if (event.type === 'response.audio_transcript.delta') {
        // Append audio text
      } else if (event.type === 'response.audio_transcript.done') {
        if (event.transcript) {
          setTranscript((prev) => [...prev, { role: 'assistant', text: event.transcript }]);
        }
      }
    } catch (err) {
      console.error('[DataChannel Parse Error]:', err);
    }
  };

  const executeClientTool = (name: string, callId: string, args: any) => {
    console.log(`[Ava Tool Execution]: ${name}`, args);

    if (name === 'display_vehicle_cards') {
      let filtered = [...INITIAL_VEHICLES];
      if (args.category && args.category !== 'All') {
        filtered = filtered.filter((v) => v.body_type.toLowerCase() === args.category.toLowerCase());
      }
      if (args.maxDailyRateTZS) {
        filtered = filtered.filter((v) => v.daily_rate <= args.maxDailyRateTZS);
      }
      if (args.forSale) {
        filtered = filtered.filter((v) => v.is_for_sale);
      } else {
        filtered = filtered.filter((v) => v.is_for_rent);
      }

      setActiveCards(filtered);
      if (onFilterVehicles) {
        onFilterVehicles(filtered);
      }

      reportToolOutput(callId, {
        success: true,
        matchingVehiclesCount: filtered.length,
        titles: filtered.map((v) => `${v.title} (${formatTZS(v.daily_rate)}/day)`),
      });
    } else if (name === 'calculate_rental_quote') {
      const quote = calculateRentalQuote({
        dailyRate: args.dailyRate || 150000,
        startDate: new Date(),
        endDate: new Date(Date.now() + (args.days || 3) * 86400000),
        hasDriver: args.hasDriver,
        distanceKm: args.distanceKm || 0,
        isDoorstepDelivery: Boolean(args.distanceKm && args.distanceKm > 0),
        isFullUpfront: args.isFullUpfront ?? true,
      });

      reportToolOutput(callId, {
        quoteSummary: `Total for ${quote.days} days: ${formatTZS(quote.finalAmount)}. Chauffeur fee: ${formatTZS(quote.driverFee)}. Delivery: ${formatTZS(quote.deliveryFee)}. Deposit required: ${formatTZS(quote.depositAmount)}.`,
        quoteDetails: quote,
      });
    } else if (name === 'open_checkout_modal') {
      setCheckoutData({
        isOpen: true,
        vehicleTitle: args.vehicleTitle || 'Selected Vehicle',
        totalAmountTZS: args.totalAmountTZS || 150000,
        bookingType: args.bookingType || 'rental',
        vehicleId: args.vehicleId,
      });

      reportToolOutput(callId, {
        status: 'Checkout modal rendered on user viewport.',
      });
    }
  };

  const reportToolOutput = (callId: string, output: any) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      const toolResponseEvent = {
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify(output),
        },
      };
      dataChannelRef.current.send(JSON.stringify(toolResponseEvent));

      const generateResponseEvent = {
        type: 'response.create',
      };
      dataChannelRef.current.send(JSON.stringify(generateResponseEvent));
    }
  };

  const handlePaymentSuccessFromModal = (bookingId: string) => {
    // Notify Ava verbally through the WebRTC Data Channel
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      const confirmationEvent = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `[System Event: Customer payment verified for Booking #${bookingId}. Verbally confirm that the reservation is locked and their official receipt in TZS has been sent to their email and WhatsApp.]`,
            },
          ],
        },
      };
      dataChannelRef.current.send(JSON.stringify(confirmationEvent));
      dataChannelRef.current.send(JSON.stringify({ type: 'response.create' }));
    }

    setTranscript((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: `Asante sana! Booking #${bookingId} is confirmed and paid in full. Your itemized TZS receipt and tax invoice PDF have been sent to your email and WhatsApp.`,
      },
    ]);
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    dataChannelRef.current = null;
    setIsCalling(false);
    setStatusText('Call ended. Ava is on standby.');
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(true);
            if (!isCalling) startVoiceCall();
          }}
          className="relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-bold shadow-2xl shadow-amber-500/30 border border-amber-300/40 hover:shadow-amber-500/50 transition-all"
        >
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
          <Sparkles className="w-5 h-5 text-slate-950" />
          <span className="tracking-wide">Talk to Ava</span>
        </motion.button>
      </div>

      {/* Voice Concierge Modal / Slide-out Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-950 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 px-6 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-extrabold shadow-md shadow-amber-500/20">
                    A
                  </div>
                  <div>
                    <h3 className="font-bold text-base flex items-center gap-2">
                      Ava Autonomous Concierge
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Realtime TZS
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">{statusText}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic Voice Waveform & Visualizer */}
              <div className="py-6 px-6 bg-gradient-to-b from-slate-900/50 to-slate-950 flex flex-col items-center justify-center border-b border-slate-900">
                <div className="flex items-center gap-1.5 h-12">
                  <span className={`w-1.5 rounded-full bg-amber-400 ${isCalling ? 'animate-soundwave-1' : 'h-2'}`}></span>
                  <span className={`w-1.5 rounded-full bg-amber-400 ${isCalling ? 'animate-soundwave-2' : 'h-2'}`}></span>
                  <span className={`w-1.5 rounded-full bg-amber-500 ${isCalling ? 'animate-soundwave-3' : 'h-2'}`}></span>
                  <span className={`w-1.5 rounded-full bg-amber-400 ${isCalling ? 'animate-soundwave-4' : 'h-2'}`}></span>
                  <span className={`w-1.5 rounded-full bg-amber-400 ${isCalling ? 'animate-soundwave-5' : 'h-2'}`}></span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  {isCalling ? 'Ava is connected • Listening via WebRTC' : 'Microphone standby'}
                </p>
              </div>

              {/* Injected Live Vehicle Cards (Triggered dynamically by Ava's tool call) */}
              {activeCards.length > 0 && (
                <div className="p-4 bg-slate-900/40 border-b border-slate-800 overflow-x-auto">
                  <div className="text-xs font-semibold uppercase text-amber-400 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Recommended Vehicles (Injected by Ava)
                  </div>
                  <div className="flex gap-3 pb-1">
                    {activeCards.map((car) => (
                      <div
                        key={car.id}
                        className="min-w-[220px] rounded-xl bg-slate-900 border border-slate-800 p-3 flex flex-col justify-between"
                      >
                        <div>
                          <img
                            src={car.cover_image}
                            alt={car.title}
                            className="w-full h-24 object-cover rounded-lg mb-2"
                          />
                          <h4 className="text-xs font-bold text-white truncate">{car.title}</h4>
                          <p className="text-[11px] text-slate-400">{car.body_type} • {car.transmission}</p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400">{formatTZS(car.daily_rate)}/day</span>
                          <button
                            onClick={() =>
                              setCheckoutData({
                                isOpen: true,
                                vehicleTitle: car.title,
                                totalAmountTZS: car.daily_rate * 3,
                                bookingType: 'rental',
                                vehicleId: car.id,
                              })
                            }
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transcript Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64 text-sm">
                {transcript.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Call Control Footer */}
              <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    disabled={!isCalling}
                    className={`p-3 rounded-xl border transition-all ${
                      isMuted
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    } disabled:opacity-40`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <div className="text-xs text-slate-400">
                    <span className="text-slate-200 font-semibold">Speak freely:</span> Ava detects voice pauses
                  </div>
                </div>

                {isCalling ? (
                  <button
                    onClick={endCall}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all"
                  >
                    <PhoneOff className="w-4 h-4" />
                    End Call
                  </button>
                ) : (
                  <button
                    onClick={startVoiceCall}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Start Call
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Embedded Stripe Checkout Modal triggered by Ava */}
      <EmbeddedCheckoutModal
        isOpen={checkoutData.isOpen}
        onClose={() => setCheckoutData((prev) => ({ ...prev, isOpen: false }))}
        vehicleTitle={checkoutData.vehicleTitle}
        totalAmountTZS={checkoutData.totalAmountTZS}
        bookingType={checkoutData.bookingType}
        vehicleId={checkoutData.vehicleId}
        onPaymentSuccess={handlePaymentSuccessFromModal}
      />
    </>
  );
};
