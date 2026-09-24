
  "use client";

  declare global {
    interface Window {
      ethereum: any;
    }
  }

  import { useState } from "react";
  import { BrowserProvider } from "ethers";
  import { useRouter } from "next/navigation";
 
  
export default function LoginPage() {
    const [walletAddress, setWalletAddress] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    async function loginWithMetaMask() {
      try {
        setLoading(true);

        if (!window.ethereum) {
          alert("MetaMask is not installed");
          return;
        }     

        const provider = new BrowserProvider(window.ethereum);

        await provider.send("eth_requestAccounts", []);

      

        const signer = await provider.getSigner();
        const address = await signer.getAddress();

          const nonceRes = await fetch("/api/auth/nonce",{
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({walletAddress : address})

        });

        const bodydata = await nonceRes.json();
        const nonce = bodydata.nonce;

        const message = `Login to DAO Investment App with wallet: ${address} \nNonce : ${nonce}`;

        const signature = await signer.signMessage(message);

        const res = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: address,
            message,
            signature,
          }),
        });

        const data = await res.json();

        if (!data.success) {
          alert("Login failed");
          return;
        }

        setWalletAddress(address);

        router.push("/Dashboard");
      } catch (error) {
        console.error(error);
        alert("Something went wrong during login");
      } finally {
        setLoading(false);
      }
    }

    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <section className="w-full max-w-md bg-black/30 backdrop-blur-sm border border-green-500/20 rounded-3xl p-10 shadow-2xl">
          
          <h1 className="text-4xl font-bold text-center text-green-400 mb-4">
            Login
          </h1>

          <p className="text-center text-gray-300 mb-8">
            Connect your MetaMask wallet to access the DAO platform.
          </p>

          <button
            onClick={loginWithMetaMask}
            disabled={loading}
            className="w-full bg-green-500 text-black font-semibold py-3 rounded-xl hover:bg-green-400 transition duration-300"
          >
            {loading
              ? "Connecting..."
              : "Connect MetaMask & Login"}
          </button>

          {walletAddress && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
              <p className="text-sm text-green-300 break-all">
                Connected Wallet:
              </p>

              <p className="text-white mt-2 break-all">
                {walletAddress}
              </p>
            </div>
          )}
        </section>
      </main>
    );
  }