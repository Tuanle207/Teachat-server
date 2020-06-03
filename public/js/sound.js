//import { Howl, Howler } from "howler";
const sound = new Howl({
  src: ["/audio/Make A Wish(Winter Poem).mp3"],
  autoplay: true,
  volume: 0.5
});
document.getElementById("play-toggle").addEventListener("change", () => {
  console.log(`test: ${sound.playing()}`);
  if (sound.playing()) {
    sound.pause();
  } else {
    sound.play();
  }
  console.log("played!");
});
