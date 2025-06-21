"use client";
import React from "react";
import { ContainerScroll } from "./container-scroll-animation";
import Image from "next/image";

const ImageComponent = Image as any;

export function HeroScrollDemo({ onAuthClick }: { onAuthClick?: () => void }) {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
              See AlgoHire in Action
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Real-time collaboration, candidate management, and team notifications all in one powerful platform
            </p>
          </>
        }
        onAuthClick={onAuthClick}
      >
        <ImageComponent
          src="/dashboard.png"
          alt="AlgoHire Dashboard"
          height={720}
          width={1000}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
} 