import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Plus,
  Eye,
  Camera,
  Wallet,
  MapPin,
  CreditCard,
  Users,
  Map,
  Database,
  Settings,
  Info,
  Boxes,
  Video,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import AgentInteractionModal from "./interaction/AgentInteractionModal";
import "./interaction/ARPaymentStyles.css";

const Hero = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [agentCount, setAgentCount] = useState(54);

  // Fetch agent count from database
  useEffect(() => {
    const fetchAgentCount = async () => {
      try {
        const { supabase } = await import("../lib/supabase");
        const { count, error } = await supabase
          .from("deployed_objects")
          .select("*", { count: "exact", head: true });

        if (!error && count !== null) {
          setAgentCount(count);
        }
      } catch (error) {
        console.error("Error fetching agent count:", error);
      }
    };

    fetchAgentCount();
  }, []);

  // Mock user location for AR Preview
  const mockUserLocation = {
    latitude: 34.0522265,
    longitude: -118.2437408,
  };

  // Enhanced fake agents with full data structure for AR Preview
  const fakeAgents = [
    {
      id: 1,
      name: "Cube 5",
      description:
        "A 3D cube object deployed in AR space. I'm an AI agent ready to help with various tasks and answer questions.",
      object_type: "AI Agent",
      latitude: 34.0522365,
      longitude: -118.2437408,
      range_meters: 25,
      interaction_fee: 10,
      interaction_types: ["chat", "voice", "video"],
      agent_wallet_type: "NEAR",
      agent_wallet_address: "cube5.near",
      mcp_integrations: ["Chat", "Voice", "Analysis", "Information Lookup"],
      is_active: true,
    },
    {
      id: 2,
      name: "Study Helper Alpha",
      description:
        "Your friendly study companion! I help students with homework, explanations, and learning strategies.",
      object_type: "Study Buddy",
      latitude: 34.0522165,
      longitude: -118.2437308,
      range_meters: 30,
      interaction_fee: 5,
      interaction_types: ["chat", "voice"],
      agent_wallet_type: "NEAR",
      agent_wallet_address: "studyhelper.near",
      mcp_integrations: ["Educational Content", "Study Planning", "Q&A"],
      is_active: true,
    },
    {
      id: 3,
      name: "Campus Guide Bot",
      description:
        "I know everything about this location! Ask me about facilities, directions, or local information.",
      object_type: "Local Services",
      latitude: 34.0522465,
      longitude: -118.2437508,
      range_meters: 50,
      interaction_fee: 8,
      interaction_types: ["chat", "voice", "video"],
      agent_wallet_type: "NEAR",
      agent_wallet_address: "campusguide.near",
      mcp_integrations: ["Location Services", "Directory", "Navigation"],
      is_active: true,
    },
    {
      id: 4,
      name: "Creative Assistant",
      description:
        "Let's create something amazing together! I help with writing, brainstorming, and creative projects.",
      object_type: "Content Creator",
      latitude: 34.0522565,
      longitude: -118.2437608,
      range_meters: 35,
      interaction_fee: 15,
      interaction_types: ["chat", "voice", "video"],
      agent_wallet_type: "NEAR",
      agent_wallet_address: "creative.near",
      mcp_integrations: ["Content Generation", "Brainstorming", "Writing"],
      is_active: true,
    },
    {
      id: 5,
      name: "Game Master",
      description:
        "Ready to play? I create fun games, puzzles, and interactive experiences for entertainment!",
      object_type: "Game Agent",
      latitude: 34.0522665,
      longitude: -118.2437708,
      range_meters: 40,
      interaction_fee: 12,
      interaction_types: ["chat", "voice", "video"],
      agent_wallet_type: "NEAR",
      agent_wallet_address: "gamemaster.near",
      mcp_integrations: ["Game Creation", "Puzzles", "Entertainment"],
      is_active: true,
    },
  ];

  // Handle agent click for AR Preview
  const handleAgentClick = (agent: any) => {
    setSelectedAgent(agent);
    setShowInteractionModal(true);
  };

  const handleCloseInteraction = () => {
    setShowInteractionModal(false);
    setSelectedAgent(null);
  };

  const phones = [
    {
      id: "deploy",
      title: "🚀 Deploy Agent",
      subtitle: "Create & Place",
      description: "Design your AI agent and deploy it at precise locations",
      buttonText: "Deploy Agent",
      buttonIcon: <Plus className="h-4 w-4" />,
      link: "/deploy",
      bgImage:
        "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
      overlayContent: (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="text-white text-2xl" />
            </div>
            <div className="font-bold text-sm">Agent Configuration</div>
            <div className="text-xs opacity-80">
              Choose type, name & location
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "experience",
      title: "💳 CubePay",
      subtitle: "Make Payment",
      description: "Experience full AR with camera and real-world AI agents",
      buttonText: "CubePay",
      buttonIcon: <Wallet className="h-4 w-4" />,
      link: "https://admirable-hamster-b9c370.netlify.app/",
      external: true,
      bgImage:
        "https://images.pexels.com/photos/3761348/pexels-photo-3761348.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1",
      overlayContent: (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Camera className="text-white text-2xl" />
            </div>
            <div className="font-bold text-sm">Live AR Camera</div>
            <div className="text-xs opacity-80">Full production experience</div>
          </div>
          <div className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-300 mr-1 animate-pulse"></div>
            Live AR
          </div>
        </div>
      ),
    },
    {
      id: "atms",
      title: "🏧 Find Virtual ATMs",
      subtitle: "Locate ATMs",
      description: "Find nearby virtual ATMs for cash access",
      buttonText: "Find Virtual ATMs",
      buttonIcon: <MapPin className="h-4 w-4" />,
      link: "http://localhost:5176/agent-map?filter=artm_terminal",
      external: true,
    },
    {
      id: "terminal",
      title: "💳 Agents in Range",
      subtitle: "Terminal Payment",
      description: "Use your payment terminal for transactions",
      buttonText: "Agents in Range",
      buttonIcon: <CreditCard className="h-4 w-4" />,
      link: "/terminal",
      external: false,
    },
  ];

  return (
    <section
      className="relative overflow-hidden pt-16 pb-20 md:pt-20 md:pb-28"
      style={{ backgroundColor: "rgb(15, 23, 42)" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                CubePay
              </span>
            </h1>
          </motion.div>
        </div>

        {/* Four Buttons in 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16 max-w-md mx-auto">
          {phones.map((phone, index) => (
            <motion.div
              key={phone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {phone.external ? (
                <a
                  href={phone.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold px-3 py-3 text-sm rounded-2xl transition-all duration-200 hover:scale-105 shadow-xl hover:shadow-2xl shadow-green-500/30 flex flex-col items-center justify-center gap-2 min-h-[60px] sm:min-h-[70px] w-full border-b-4 border-green-700"
                >
                  {phone.buttonIcon}
                  {phone.buttonText}
                </a>
              ) : (
                <Link
                  to={phone.link}
                  className="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold px-3 py-3 text-sm rounded-2xl transition-all duration-200 hover:scale-105 shadow-xl hover:shadow-2xl shadow-green-500/30 flex flex-col items-center justify-center gap-2 min-h-[60px] sm:min-h-[70px] w-full border-b-4 border-green-700"
                >
                  {phone.buttonIcon}
                  {phone.buttonText}
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Minimalistic Navigation Grid */}
        <div className="grid grid-cols-2 gap-3 mt-12 max-w-md mx-auto">
          {/* CubePay */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 group"
          >
            <Camera className="h-6 w-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-gray-300 font-medium">CubePay</span>
          </Link>

          {/* Agents Marketplace */}
          <Link
            to="/marketplace"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 group relative"
          >
            <Users className="h-6 w-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-gray-300 font-medium">
              Agents Marketplace
            </span>
            <span className="absolute -top-1 -right-1 bg-green-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {agentCount}
            </span>
          </Link>

          {/* Agent Map */}
          <a
            href="http://localhost:5176/agent-map"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 group"
          >
            <Map className="h-6 w-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-gray-300 font-medium">Agent Map</span>
          </a>

          {/* Database */}
          <Link
            to="/database"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 group"
          >
            <Database className="h-6 w-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-gray-300 font-medium">Database</span>
          </Link>

          {/* Wallet */}
          <Link
            to="/wallet"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 group"
          >
            <Wallet className="h-6 w-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-gray-300 font-medium">Wallet</span>
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 group"
          >
            <Settings className="h-6 w-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-gray-300 font-medium">Settings</span>
          </Link>

          {/* About */}
          <Link
            to="/about"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 group"
          >
            <Info className="h-6 w-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-gray-300 font-medium">About</span>
          </Link>

          {/* QR Tests */}
          <Link
            to="/qr-tests"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 group"
          >
            <Zap className="h-6 w-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-gray-300 font-medium">QR Tests</span>
          </Link>

          {/* Cube Demo */}
          <Link
            to="/cube-demo"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 group"
          >
            <Boxes className="h-6 w-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-gray-300 font-medium">Cube Demo</span>
          </Link>

          {/* Camera Test */}
          <Link
            to="/camera-test"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 group"
          >
            <Video className="h-6 w-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-gray-300 font-medium">
              Camera Test
            </span>
          </Link>
        </div>
      </div>

      {/* Enhanced Interaction Modal for AR Preview */}
      <AgentInteractionModal
        agent={selectedAgent}
        visible={showInteractionModal}
        onClose={handleCloseInteraction}
        userLocation={mockUserLocation}
      />
    </section>
  );
};

export default Hero;
