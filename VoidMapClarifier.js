// these are the calculated number of cells needed to clear for a 99% chance, 50% chance, and 1% chance of having gotten the void map that quickly
// they are rounded up, though, for nicer displaying.
const Wombats_VMC_VMRate_random_unlucky = 2200; // 99%
const Wombats_VMC_VMRate_random_average = 890; // 50%
const Wombats_VMC_VMRate_random_lucky = 100; // 1%
// for doing predictive voids-up-to-here: (unrounded because these ones don't end up getting printed directly)
const Wombats_VMC_VMRate_middling_lucky = 700; // 40%
const Wombats_VMC_VMRate_middling_unlucky = 1000; // 60%
// previous estimates based on CDF:
//  1% chance is at 104.5 cells; 99% chance is at 2148.5 cells.
// 10% chance is at 328.5 cells; 90% chance is at 1520.5 cells.
// 25% chance is at 540.5 cells; 75% chance is at 1180.5 cells.
// 40% chance is at 718.5 cells; 60% chance is at  960.5 cells.
//                50% chance is at 836.5 cells.
// formulae:
//     per_cell = floor(x/10) / 50000
//     cumulative = 1 - prod(n=1->x) [1-per_cell(n)] (presumed - disagrees with montecarlo test, but maybe i just misread the cdf?)
initialiseVoidMapClarifier();

function initialiseVoidMapClarifier() {
    if (document.getElementById('VoidMapClarifier') === null) {
        const containerVoidMapInfo = document.createElement('DIV');
  
        let standard_colours = ' color: rgb(0,0,0); background-color: rgb(255,255,255);';
        let darkmode_colours = ' color: rgb(0,0,0); background-color: rgb(93,93,93);';
    
        let chosen_colours = standard_colours;
        if (game.options.menu.darkTheme.enabled == 2) {
            chosen_colours = darkmode_colours;
        }
        containerVoidMapInfo.setAttribute('style', 'display: block; position: absolute; top: 0; right: 0; width: 30%; font-size: 0.7em; text-align: center;' + chosen_colours);
        containerVoidMapInfo.setAttribute('class', 'pointer noselect');
        const textareaVoidmapInfo = document.createElement('SPAN');
        containerVoidMapInfo.setAttribute('onmouseover', VMC_populateVoidMapTooltip());
        containerVoidMapInfo.setAttribute('onmouseout', 'tooltip("hide")');
        containerVoidMapInfo.setAttribute('onclick', 'window.open("https://stellar-demesne.github.io/Trimps-VoidMapClarifier/")');
        textareaVoidmapInfo.id = 'VoidMapClarifier';
        containerVoidMapInfo.appendChild(textareaVoidmapInfo);
        let target_area = document.getElementById('science');
        target_area.insertBefore(containerVoidMapInfo, target_area.children[0]);
    }
    populateVoidMapClarifierInfo();
    setInterval( function () {
        populateVoidMapClarifierInfo();
    }, 1000);
}

function VMC_getShieldVMDC_current_decimal() {
    return (1 - (getHeirloomBonus("Shield", "voidMaps") / 100))
}

function VMC_getShieldVMDC_max_decimal() {
    let rarity = game.global.ShieldEquipped.rarity;
    let hardCap =  game.heirlooms.Shield.voidMaps.max[rarity];
    let currentActualCap = scaleHeirloomModUniverse("Shield", "voidMaps", hardCap)
    return (1 - (currentActualCap / 100));
}

function VMC_getMaxObservableHeirloomRarity() {
    let maxZone = game.global.highestLevelCleared + 1;
    if (game.global.totalRadPortals > 0) {
        maxZone = game.global.highestRadonLevelCleared + 1;
    }
    let maxRaritiesDropchanceBandNumber = getHeirloomZoneBreakpoint(maxZone, true);
    let maxRaritiesDropchances = game.heirlooms.rarities[(maxRaritiesDropchanceBandNumber)];
    let highestRarityIndex = maxRaritiesDropchances.length - 1;
    return highestRarityIndex;
}

function VMC_currentRarityRangeHasHigherVMDCCap() {
    let current_cap_effect = VMC_getShieldVMDC_max_decimal();
    let highrarity_cap_effect = VMC_getMaxRarityVMDC_max_decimal();
    return (highrarity_cap_effect != current_cap_effect)
}

function VMC_getMaxRarityVMDC_max_decimal() {
    let max_rarity = VMC_getMaxObservableHeirloomRarity() //getHeirloomRarityRanges(game.global.highestRadonLevelCleared, true).length - 1
    let maxCap = game.heirlooms.Shield.voidMaps.max[max_rarity]
    let maxActualCap = scaleHeirloomModUniverse("Shield", "voidMaps", maxCap)
    return (1 - (maxActualCap / 100));
}
function VMC_getMaxRarity_isAtHazThreshhold() {
    let max_rarity = VMC_getMaxObservableHeirloomRarity() //getHeirloomRarityRanges(game.global.highestRadonLevelCleared, true).length - 1;
    return (max_rarity == 10)
}

function VMC_getCurrentVMDCeffect() {
    let shieldbonus = VMC_getShieldVMDC_current_decimal()
    let extraV = 0;
	if (game.challenges.Nurture.boostsActive() && game.challenges.Nurture.getLevel >= 4) {
        extraV = 0.2;
    }
    let goldenbonus = (1 - (game.goldenUpgrades.Void.currentBonus + extraV))
    return shieldbonus * goldenbonus
}

function VMC_GetCurrentMaxVMDCeffect() {
    let shieldbonus = VMC_getShieldVMDC_max_decimal()
    let extraV = 0;
	if (game.challenges.Nurture.boostsActive() && game.challenges.Nurture.getLevel >= 4) {
        extraV = 0.2;
    }
    let goldenbonus = (1 - (game.goldenUpgrades.Void.currentBonus + extraV))
    return shieldbonus * goldenbonus
}

function VMC_getMaxRarityMaxVMDCeffect() {
    let shieldbonus = VMC_getMaxRarityVMDC_max_decimal()
    let extraV = 0;
	if (game.challenges.Nurture.boostsActive() && game.challenges.Nurture.getLevel >= 4) {
        extraV = 0.2;
    }
    let goldenbonus = (1 - (game.goldenUpgrades.Void.currentBonus + extraV))
    return shieldbonus * goldenbonus
}

function VMC_getNoShieldVMDCeffect() {
    let extraV = 0;
	if (game.challenges.Nurture.boostsActive() && game.challenges.Nurture.getLevel >= 4) {
        extraV = 0.2;
    }
    let goldenbonus = (1 - (game.goldenUpgrades.Void.currentBonus + extraV))
    return goldenbonus
}

function VMC_getMaxGoldenVMDCeffect() {
    let shieldbonus = VMC_getShieldVMDC_current_decimal()
    let extraV = 0;
	if (game.challenges.Nurture.boostsActive() && game.challenges.Nurture.getLevel >= 4) {
        extraV = 0.2;
    }
    let goldenbonus = (1 - (0.72 + extraV))
    return shieldbonus * goldenbonus
}
function VMC_getMinGoldenVMDCeffect() {
    let shieldbonus = VMC_getShieldVMDC_current_decimal()
    let extraV = 0;
	if (game.challenges.Nurture.boostsActive() && game.challenges.Nurture.getLevel >= 4) {
        extraV = 0.2;
    }
    let goldenbonus = (1 - (extraV))
    return shieldbonus * goldenbonus
}

function VMC_getsocalledZ() {
    let max = getVoidMaxLevel();
    let lastPortal = getLastPortal();
    if ((lastPortal != -1) && (max - lastPortal < 25)) {
        max = lastPortal;
    }
    if (max > 200) {
        max = 200;
    }
    let min = (max > 80) ? (1000 + ((max - 80) * 13)) : 1000;

    return min
}

function VMC_getCurrentVMDropCooldown() {
    let netBonus = VMC_getCurrentVMDCeffect();
    let naturalCooldownCellCount = VMC_getsocalledZ();
    return Math.ceil(netBonus * naturalCooldownCellCount)
}
function VMC_getFullGoldenVMDropWait() {
    let netBonus = VMC_getMaxGoldenVMDCeffect();
    let naturalCooldownCellCount = VMC_getsocalledZ();
    return Math.ceil(netBonus * naturalCooldownCellCount) + Wombats_VMC_VMRate_random_average
}
function VMC_getNoGoldenVMDropWait() {
    let netBonus = VMC_getMinGoldenVMDCeffect();
    let naturalCooldownCellCount = VMC_getsocalledZ();
    return Math.ceil(netBonus * naturalCooldownCellCount) + Wombats_VMC_VMRate_random_average
}

function VMC_getNoShieldVMDropCooldown() {
    let netBonus = VMC_getNoShieldVMDCeffect();
    let naturalCooldownCellCount = VMC_getsocalledZ();
    return Math.ceil(netBonus * naturalCooldownCellCount)
}
function VMC_getNoShieldExpectedVMWait() {
    return VMC_getNoShieldVMDropCooldown() + Wombats_VMC_VMRate_random_average
}

function VMC_getMaximisedCurrentExpectedVMWait() {
    let netBonus = VMC_GetCurrentMaxVMDCeffect();
    let naturalCooldownCellCount = VMC_getsocalledZ();
    let dropCooldown = Math.ceil(netBonus * naturalCooldownCellCount)
    return dropCooldown + Wombats_VMC_VMRate_random_average
}

function VMC_getMaxRarityMaxVMDCExpectedVMWait() {
    let netBonus = VMC_getMaxRarityMaxVMDCeffect();
    let naturalCooldownCellCount = VMC_getsocalledZ();
    let dropCooldown = Math.ceil(netBonus * naturalCooldownCellCount)
    return dropCooldown + Wombats_VMC_VMRate_random_average
}

function VMC_getCurrentExpectedVMWait() {
    return VMC_getCurrentVMDropCooldown() + Wombats_VMC_VMRate_random_average;
}
function VMC_getLuckyVMWait() {
    return VMC_getCurrentVMDropCooldown() + Wombats_VMC_VMRate_random_lucky;
}
function VMC_getUnluckyVMWait() {
    return VMC_getCurrentVMDropCooldown() + Wombats_VMC_VMRate_random_unlucky;
}
function VMC_getSomewhatLuckyVMWait() {
    return VMC_getCurrentVMDropCooldown() + Wombats_VMC_VMRate_middling_lucky;
}
function VMC_getSomewhatUnluckyVMWait() {
    return VMC_getCurrentVMDropCooldown() + Wombats_VMC_VMRate_middling_unlucky;
}

function VMC_getGoldenVoidVarianceText() {
    let varianceText = '';
    if (game.goldenUpgrades.Void.currentBonus < 0.72) {
        varianceText += `With 8 Golden Voids, your estimated cells-per-void-map would be ` + VMC_getFullGoldenVMDropWait() + `. `;
    }
    if (game.goldenUpgrades.Void.currentBonus > 0) {
        varianceText += `With 0 Golden Voids, your estimated cells-per-void-map would be ` + VMC_getNoGoldenVMDropWait() + `. `;
    }
    let difference_in_percentage = ((VMC_getNoGoldenVMDropWait() / VMC_getFullGoldenVMDropWait()) * 100) - 100;
    varianceText += `Buying 8 golden voids means you`;
    if (game.goldenUpgrades.Void.currentBonus < 0.72) {
        varianceText += ` would`;
    }
    varianceText += ` get void maps about `;
    varianceText += `<b>` + prettify(difference_in_percentage) + `%</b> faster.`;
    return varianceText
}

function VMC_getShieldloomVarianceText() {
    let varianceText = '';
    let current_vmdc = VMC_getShieldVMDC_current_decimal();
    let current_max = VMC_getShieldVMDC_max_decimal();
    let maxrarity_max = VMC_getMaxRarityVMDC_max_decimal();
    if (current_vmdc > current_max) {
        // can improve shield
        let upgraded_shield_boost_percentage = ((VMC_getCurrentExpectedVMWait() / VMC_getMaximisedCurrentExpectedVMWait()) * 100) - 100;
        varianceText += `With a shield of currently equipped rarity with maxed VMDC, you would get voids about `
        varianceText += prettify(upgraded_shield_boost_percentage) + `% faster. `
    }
    if (VMC_currentRarityRangeHasHigherVMDCCap()) {
        // can up rarity, with higher VMDC cap! (ouch)
        let max_rarity_shield_boost_percentage = ((VMC_getCurrentExpectedVMWait() / VMC_getMaxRarityMaxVMDCExpectedVMWait()) * 100) - 100;
        varianceText += `If you got the new rarity of shield with maxed VMDC, you`
        if (VMC_getMaxRarity_isAtHazThreshhold()) {
            varianceText += ` would`;
        } else {
            varianceText += ` could`;
        }
        varianceText += ` get voids about ` 
        if (VMC_getMaxRarity_isAtHazThreshhold()) {
            // technically a "downgrade"
            varianceText += prettify(-max_rarity_shield_boost_percentage);
            varianceText += `% slower, except also much faster in another way. <em>This <b>is</b> a buff</em>. `
        } else {
            varianceText += prettify(max_rarity_shield_boost_percentage);
            varianceText += `% faster. `
        }
    }
    if (current_vmdc < 1) {
        // can worsen shield
        let shield_boost_percentage = ((VMC_getNoShieldExpectedVMWait() / VMC_getCurrentExpectedVMWait()) * 100) - 100;
        varianceText += `Your current shield is giving you void maps about <b>` + prettify(shield_boost_percentage) + `%</b> faster`
        if (game.global.ShieldEquipped.rarity >= 10) {
            varianceText += `,  as well as an additional free void map every 1000 cells cleared with it equipped.`
            varianceText += ` You last got one ` + game.global.hazShieldCredit + ` cells ago.`;
        } else {
            varianceText += '.';
        }
    }

    return varianceText
}

function VMC_makeStringForDisplay() {
    if ((game.global.totalPortals < 1) || (game.global.universe == 2 && game.global.totalRadPortals < 1)) {
        return 'N/A';
    }
    
    const voidmapstring = game.global.lastVoidMap + "<br\>/ " + VMC_getCurrentExpectedVMWait();
    return voidmapstring
}

function VMC_getCurrentTotalVoids() {
    return game.global.totalVoidMaps + game.stats.totalVoidMaps.value;
}

function VMC_getEstimateVoidsWithGivenWait(estimatedCellsPerVoid) {
    let currentCellTotal = (game.stats.zonesCleared.value * 100) + game.global.lastClearedCell;
    let expectedBasicVoidsThisRun = currentCellTotal / estimatedCellsPerVoid;

    let expectedHazVoidsThisRun = 0;
    if (game.global.ShieldEquipped && game.global.ShieldEquipped.rarity >= 10 && game.heirlooms.Shield.voidMaps.currentBonus > 0) {
        expectedHazVoidsThisRun = currentCellTotal / 1000
    }

    let voidspecVoidCount = 0;
    if (game.talents.voidSpecial.purchased) {
        voidspecVoidCount += Math.floor(getLastPortal() / 100);
        if (game.talents.voidSpecial2.purchased) {
            voidspecVoidCount += Math.floor((getLastPortal() + 50) / 100);
        }
    }

    let petVoidCount = 0;
    if (Fluffy.isRewardActive('voidance')) {
        petVoidCount += 4;
    }
    if (Fluffy.isRewardActive('voidelicious')) {
        petVoidCount += 16;
    }
    if (Fluffy.isRewardActive('moreVoid')) {
        if (game.global.lastU2Voids >= 5 && game.global.universe == 2) {
            petVoidCount = game.global.lastU2Voids / 5
        }
    }

    let voidmapPermaBonus = game.permaBoneBonuses.voidMaps.owned;
    let netBoneVoidsBoost = (100 + voidmapPermaBonus) / 100;

    let totalnetVoidMapEstimate = netBoneVoidsBoost * (expectedBasicVoidsThisRun + expectedHazVoidsThisRun + voidspecVoidCount + petVoidCount );
    return totalnetVoidMapEstimate;
}

function VMC_stringifyCurrentBoneBonusTimer() {
    let current_tracker_moment = game.permaBoneBonuses.voidMaps.tracker;
    let current_number_owned = game.permaBoneBonuses.voidMaps.owned;
    if (current_number_owned == 0) {
        return ''
    }
    let drops_until_next_double = Math.floor((99 - current_tracker_moment) / current_number_owned);
    if (drops_until_next_double <= 0) {
        return 'Your next void map drop will be duplicated!'
    }
    let returntext = 'Your next duplicated void map drop is <b>' + drops_until_next_double + '</b> drop';
    if (drops_until_next_double != 1) {
        returntext += 's';
    }
    returntext += ' away.'
    return returntext
}

function VMC_populateVoidMapTooltip() {
    if (usingRealTimeOffline == true) {
      return '';
    }
    if (game.global.totalPortals < 1) {
        return "tooltip('A Secret Tool for Later', 'customText', event, '<p>This is little box will be relevant later, but do not worry about it for now."
            + " It is mostly just showing up here already to confirm that the mod has loaded.</p>"
            + "<p>Have fun exploring the game!</p>')";
    }
    if ((game.stats.totalVoidMaps.valueTotal < 1)) {
        return "tooltip('A Secret Tool for Later', 'customText', event, '<p>You feel that there is something in your future which is going to be Nice..."
            + " but you cannot tell for certain what, or even quite where, it is. Still, it seems to be getting closer with every enemy you defeat.</p>"
            + "<p>Have fun exploring the game!</p>')";
    }
    let tooltipstring = "tooltip('Void Map Drop Rate Breakdown', 'customText', event, '";
    if ((game.global.universe == 2 && game.global.totalRadPortals < 1)) {
        tooltipstring += `<p>Sadly, you will be unable to get Void Maps in this new universe until you have portalled once.`
        tooltipstring += ` Good luck in this new realm, friend!</p>`
        tooltipstring += `<hr/>`
        tooltipstring += `<p>Click to open a page with details about how Void Maps drop</p>`;
        tooltipstring += "')"
        return tooltipstring;
    }
    tooltipstring += `<p>Your current Void Map Drop Cooldown is <b>` + VMC_getCurrentVMDropCooldown()
    tooltipstring += `</b>.`;
    tooltipstring += ` You got your last void map <b>` + game.global.lastVoidMap + `</b> cells ago.`;
    if (VMC_getCurrentVMDropCooldown() > game.global.lastVoidMap) {
        tooltipstring += ` You need to clear <b>` + (VMC_getCurrentVMDropCooldown() - game.global.lastVoidMap)
        tooltipstring += `</b> more cells before you could possibly get the next void map.`;
    } else {
        let chance = (Math.floor((game.global.lastVoidMap - VMC_getCurrentVMDropCooldown()) / 10) / 50000) * 100
        tooltipstring += ` You currently have a <b>` + prettify(chance) + `%</b> chance to get a void map every cell you clear.`
    }
    tooltipstring += `</p>`;
    tooltipstring += `<p>Statistically, you will get a void map to drop every <b>` + VMC_getCurrentExpectedVMWait()
    tooltipstring += `</b> cells; however, this is a pretty wide random distribution.`;
    tooltipstring += ` 1% of the time, you will get void maps every <b>` + VMC_getLuckyVMWait() + `</b> cells,`
    tooltipstring += ` and 1% of the time, you will get void maps only every <b>` + VMC_getUnluckyVMWait() + `</b> cells.`;
    tooltipstring += `</p>`;
    tooltipstring += `<p>` + VMC_getShieldloomVarianceText() + `</p>`;
    tooltipstring += `<p>` + VMC_getGoldenVoidVarianceText() + `</p>`;
    tooltipstring += `<p>` + VMC_stringifyCurrentBoneBonusTimer() + `</p>`;
    tooltipstring += `<p>You have gotten <b>` + VMC_getCurrentTotalVoids() + `</b> void maps total this run!</p>`;
    tooltipstring += `<p>With your current <b>` + prettify(100 - Math.round(VMC_getCurrentVMDCeffect()*100)) + `%</b> VMDC,`
    tooltipstring += ` you would expect to have gotten something like (estimate!) <b>`
    tooltipstring += prettify(VMC_getEstimateVoidsWithGivenWait(VMC_getCurrentExpectedVMWait())) + `</b> void maps.`;
    let a_bit_lucky_version = VMC_getEstimateVoidsWithGivenWait(VMC_getSomewhatLuckyVMWait());
    let a_bit_unlucky_version = VMC_getEstimateVoidsWithGivenWait(VMC_getSomewhatUnluckyVMWait());
    tooltipstring += ` However, anywhere from ` + prettify(a_bit_unlucky_version) + ` to ` + prettify(a_bit_lucky_version) + ` are within 10% odds.`
    tooltipstring += ` (these numbers are likely very wrong if you switched heirlooms. be not alarmed)</p>`;
    tooltipstring += `<hr/>`
    tooltipstring += `<p>Click to open a page with details about how Void Maps drop</p>`;
    tooltipstring += "')"
    return tooltipstring
}

function populateVoidMapClarifierInfo() {
    if (usingRealTimeOffline == true) {
      return '';
    }

    const target_element = document.getElementById('VoidMapClarifier');
    const the_information = VMC_makeStringForDisplay();
    target_element.innerHTML = the_information;
    target_element.parentNode.setAttribute('onmouseover', VMC_populateVoidMapTooltip());
}
