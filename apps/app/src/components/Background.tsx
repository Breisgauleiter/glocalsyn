import React from 'react';

export function Background() {
  const nebulaUrl = ((import.meta as any).env?.VITE_NEBULA_URL as string | undefined) ?? '/nebula.png';
  return (
    <>
      <div aria-hidden className="bg-sky" />
      <div aria-hidden className="nebula-img" style={{ ['--nebula-image' as any]: `url(${nebulaUrl})` }} />
      <div aria-hidden className="starfield" />
    </>
  );
}
