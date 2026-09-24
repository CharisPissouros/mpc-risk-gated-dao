// import Link from "next/link";
// export default function HomePage() {
//   return (
//     <main style={{ padding: "40px" }}>
//       <h1>DAO Investment Platform</h1>
      

//       <p>
//         A decentralized platform for investment proposals using DAO governance,
//         MetaMask authentication, and MPC-based risk evaluation.
//       </p>

//       <div style={{ marginTop: "30px" }}>
//         <Link href="/signup">
//           <button>Sign Up</button>
//         </Link>

//         <Link href="/login">
//           <button style={{ marginLeft: "10px" }}>
//             Login
//           </button>
//         </Link>
//       </div>

     
//     </main>
//   );
// }

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <section className="max-w-4xl text-center bg-black/30 border border-green-400/20 rounded-3xl p-12 shadow-2xl">
        <h1 className="text-5xl font-bold text-green-400 mb-6">
          DAO Investment Platform
        </h1>

        <p className="text-xl text-gray-200 mb-10 leading-relaxed">
          A decentralized platform for investment proposals using DAO governance,
          MetaMask authentication, and MPC-based risk evaluation.
        </p>

        <div className="flex justify-center gap-5">
          <Link
            href="/signup"
            className="bg-green-500 text-black px-8 py-3 rounded-xl font-semibold hover:bg-green-400 transition"
          >
            Sign Up
          </Link>

          <Link
            href="/login"
            className="border border-green-400 text-green-300 px-8 py-3 rounded-xl font-semibold hover:bg-green-500 hover:text-black transition"
          >
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}