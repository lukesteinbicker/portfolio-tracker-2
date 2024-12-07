import React from "react";

export default async function Index() {
  return (
    <main className="flex-1 flex flex-col relative">
  <div className="h-[40rem] w-full flex items-center justify-center bg-background/[0.96] antialiased bg-grid-foreground/[0.02] relative overflow-hidden">
    <div className="p-4 max-w-7xl mx-auto z-10 w-full">
      <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
        A warm welcome to the <br /> Securities and Exchange Commission!
      </h1>
      <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
        Enter if you know the code.
      </p>
    </div>
  </div>
</main>
  );
}
