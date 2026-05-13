const dns = require("dns");
const mongoose = require("mongoose");

/** When SRV lookup fails (querySrv ECONNREFUSED), try DNS_SERVERS=8.8.8.8,8.8.4.4 in .env */
function applyOptionalDnsServers() {
  const raw = process.env.DNS_SERVERS;
  if (!raw || !raw.trim()) return;
  const servers = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length) {
    dns.setServers(servers);
  }
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI in environment (.env)");
    process.exit(1);
  }

  applyOptionalDnsServers();

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error);
    if (error.code === "ECONNREFUSED" && error.syscall === "querySrv") {
      console.error(
        "\nDNS SRV lookup for mongodb+srv:// failed. Common fixes:\n" +
          "  • Add to .env: DNS_SERVERS=8.8.8.8,8.8.4.4 then restart (uses public DNS for SRV).\n" +
          "  • Try another network or toggle VPN; check firewall/antivirus.\n" +
          "  • In Atlas: Connect → Drivers → use the standard (non-SRV) mongodb://… string.\n" +
          "  • On Windows: ipconfig /flushdns\n"
      );
    }
    process.exit(1);
  }
};

module.exports = connectDB;