const fs = require("fs");

const filePath = "./src/components/MultiChainAgentDashboard.tsx";
let content = fs.readFileSync(filePath, "utf8");

// Find and replace the loadAgents function
const oldLoadAgents = `  const loadAgents = async () => {
    try {
      setLoading(true);

      console.log("📊 DIRECT QUERY: Loading comprehensive agent data...");

      // Use the new AgentDataService for comprehensive data
      const agents = await // AgentDataService.getAllAgents({
        network: networkFilter !== "all" ? networkFilter : undefined,
        agent_type: statusFilter !== "all" ? statusFilter : undefined,
      });`;

const newLoadAgents = `  const loadAgents = async () => {
    try {
      setLoading(true);

      console.log("📊 Loading agents from database...");

      // Simple direct query - get all active agents
      const { data, error } = await supabase
        .from("deployed_objects")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error loading agents:", error);
        throw error;
      }

      console.log(\`✅ Loaded \${data?.length || 0} agents from database\`);
      
      if (data && data.length > 0) {
        console.log("✅ First agent sample:", {
          id: data[0].id,
          name: data[0].name,
          agent_identity: data[0].agent_identity,
          object_type: data[0].object_type,
          hedera_account_id: data[0].hedera_account_id,
        });
      }

      // Map to DeployedAgent format
      const mappedAgents = (data || []).map((agent) => ({
        ...agent,
        deployment_network: {
          primary: {
            name: agent.deployment_network_name || agent.network || "Unknown",
            chainId: agent.deployment_chain_id || agent.chain_id || "Unknown",
          },
          additional: [],
          cross_chain_enabled: false,
        },
        supported_networks: [agent.network || "Unknown"],
        status: agent.deployment_status || "active",
      }));

      setAgents(mappedAgents);`;

content = content.replace(oldLoadAgents, newLoadAgents);

// Remove the rest of the old code
content = content.replace(
  /console\.log\(\s*`✅ DIRECT QUERY:[\s\S]*?setAgents\(agents\);/m,
  ""
);

fs.writeFileSync(filePath, content);
console.log("✅ Dashboard load function fixed!");
