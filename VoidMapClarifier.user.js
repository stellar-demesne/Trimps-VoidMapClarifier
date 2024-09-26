// ==UserScript==
// @name         VoidMap-Clarifier
// @namespace    https://github.com/stellar-demesne/Trimps-VoidMapClarifier
// @version      1.0
// @updateURL    https://github.com/stellar-demesne/Trimps-VoidMapClarifier/VoidMapClarifier.user.js
// @description  Runetrinket Counter for Trimps
// @author       StellarDemesne
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @grant        none
// ==/UserScript==
var script = document.createElement('script');
script.id = 'VoidMap-Clarifier';
script.src = 'https://stellar-demesne.github.io/Trimps-VoidMapClarifier/VoidMapClarifier.js';
script.setAttribute('crossorigin', "anonymous");
document.head.appendChild(script);
