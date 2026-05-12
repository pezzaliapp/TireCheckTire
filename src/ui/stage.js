// The single morphing surface. One scene visible at a time. Scenes:
//   bay      — the lift, ready
//   capture  — camera viewfinder
//   thinking — AI working
//   diagnose — diagnostic surface
//   quote    — document composition
//   vault    — history
//   entry    — single archived entry

import { createStore } from "../core/state.js";

const SCENES = ["bay", "capture", "thinking", "diagnose", "quote", "vault", "entry"];

export const stage = createStore({ scene: "bay", payload: null, history: [] });

export function goto(scene, payload = null) {
  if (!SCENES.includes(scene)) throw new Error("Unknown scene: " + scene);
  stage.set(s => ({
    scene,
    payload,
    history: [...s.history.slice(-9), { scene: s.scene, payload: s.payload }]
  }));
}

export function back() {
  const s = stage.get();
  const prev = s.history[s.history.length - 1];
  if (!prev) return goto("bay");
  stage.set({ scene: prev.scene, payload: prev.payload, history: s.history.slice(0, -1) });
}

export function applyToDOM() {
  const s = stage.get();
  document.querySelectorAll("[data-scene]").forEach(el => {
    el.classList.toggle("is-active", el.dataset.scene === s.scene);
  });
  document.body.dataset.scene = s.scene;
}

stage.subscribe(applyToDOM);
