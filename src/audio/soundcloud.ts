import {
  activeDeliveryTarget,
  getStyle,
  normalizeProjectTitle,
  projectBpm,
  projectFileStem,
  projectKey,
  projectSessionBrief
} from "../domain/workstation";
import type { ProjectState } from "../domain/workstation";
import { wavBitDepth, wavChannels, wavSampleRate } from "./render";

function channelLabel(channels: number): string {
  return channels === 2 ? "stereo" : channels === 1 ? "mono" : `${channels} channels`;
}

function uploadValue(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function soundCloudTags(project: ProjectState): string[] {
  const style = getStyle(project);
  const target = activeDeliveryTarget(project);
  return [style.name, "Instrumental", "Beat", `${projectBpm(project)} BPM`, target.name, "Original"];
}

export function soundCloudUploadSheetFileName(project: ProjectState): string {
  return `${projectFileStem(project)}-soundcloud-upload.md`;
}

export function createSoundCloudUploadSheet(project: ProjectState): string {
  const title = normalizeProjectTitle(project.title);
  const style = getStyle(project);
  const brief = projectSessionBrief(project);
  const target = activeDeliveryTarget(project);
  const tags = soundCloudTags(project).map((tag) => (tag.includes(" ") ? `"${tag}"` : tag)).join(" ");
  const artist = uploadValue(brief.artist, "[ARTIST NAME — replace before upload]");
  const mood = uploadValue(brief.vibe, `${style.name} / focused / original instrumental`);
  const background = uploadValue(brief.notes, "Created locally from editable GrooveForge musical events and built-in synthesis.");

  return [
    "# SoundCloud Upload Sheet",
    "",
    "## Copy-ready metadata",
    "",
    `- Title: ${title}`,
    `- Artist: ${artist}`,
    "- Rightsholder: [RIGHTSHOLDER NAME — replace before upload]",
    `- Main genre: ${style.name}`,
    `- BPM: ${projectBpm(project)}`,
    `- Key: ${projectKey(project)}`,
    `- Mood: ${mood}`,
    `- Tags (English): ${tags}`,
    `- Delivery target: ${target.name}`,
    "- License: All Rights Reserved (confirm ownership before choosing)",
    "- Initial privacy: Private",
    "- Downloads: Off",
    "- Monetization / Distribution / Content ID: Off until rights and release metadata are verified",
    "",
    "## Description draft",
    "",
    `${title} — ${style.name} instrumental at ${projectBpm(project)} BPM in ${projectKey(project)}.`,
    "",
    background,
    "",
    `Upload source: lossless RIFF/WAVE, ${channelLabel(wavChannels)}, ${wavSampleRate / 1000} kHz, signed PCM ${wavBitDepth}-bit.`,
    "",
    "Credits: [ADD PRODUCER, WRITER, PERFORMER, FEATURE, AND SAMPLE/LIBRARY CREDITS AS APPLICABLE]",
    "",
    "## Artwork brief",
    "",
    `Create original square artwork that matches “${title}” and the ${mood} mood. Use only artwork you own or are licensed to publish. Keep the artist and title consistent with the metadata.`,
    "",
    "## Private-first upload checklist",
    "",
    `1. Upload ${projectFileStem(project)}-demo.wav from this package on SoundCloud's Upload page.`,
    "2. Replace every bracketed placeholder and confirm title, artist, credits, rightsholder, genre, tags, description, artwork, license, and release date.",
    "3. Confirm you own or have permission for every musical and visual element. Crediting a third party alone is not permission.",
    "4. Keep the first upload Private and Downloads Off. SoundCloud downloads provide the original uploaded file when enabled.",
    "5. After processing, listen to the transcoded stream from start to finish on headphones and speakers; check the intro, loudest section, low end, transitions, and ending.",
    "6. Decide Public/Scheduled, Downloads, monetization, distribution, and Content ID only after the audio, metadata, artwork, collaborators, and rights are approved.",
    "",
    "## Technical note",
    "",
    `This ${wavBitDepth}-bit WAV is a user-requested lossless source, not a claim that SoundCloud requires ${wavBitDepth}-bit audio or that the file is professionally mastered. GrooveForge's local peak/RMS checks are not LUFS, true-peak, platform acceptance, or mastering guarantees.`,
    "",
    "## Official SoundCloud references (checked 2026-07-23)",
    "",
    "- Upload requirements: https://help.soundcloud.com/hc/en-us/articles/360039171614-Upload-Requirements",
    "- Getting started with uploading: https://help.soundcloud.com/hc/en-us/articles/46021990888219-Getting-started-with-Uploading",
    "- Privacy settings: https://help.soundcloud.com/hc/en-us/articles/46020211210523-Edit-your-track-s-privacy-settings",
    "- Track permissions and original-file downloads: https://help.soundcloud.com/hc/en-us/articles/31423603670043-Manage-your-track-s-permissions",
    ""
  ].join("\n");
}
