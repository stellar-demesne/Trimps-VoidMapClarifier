// these are the calculated number of cells needed to clear for a 99% chance, 50% chance, and 1% chance of having gotten the void map that quickly
// they are rounded up, though, for nicer displaying.
const Wombats_VMC_VMRate_random_unlucky = 2219; // 99%
const Wombats_VMC_VMRate_random_average = 859; // MEAN. median is 801
const Wombats_VMC_VMRate_random_lucky = 90; // 1%
// for doing predictive voids-up-to-here: (unrounded because these ones don't end up getting printed directly)
// these two are based on numbers akin to median, not mean, so they lean more generous than stingy. not sure how/if to make that better.
const Wombats_VMC_VMRate_middling_lucky = 683; // 40%
const Wombats_VMC_VMRate_middling_unlucky = 925; // 60%
// Mean 857.625, Median 801
// Standard Deviation 473.451
// Min 11, max 3087
// based on complete and over-shooting survey, allowing every seed-start that finds a void map before seed 1161999
// which is max starting seed 999999 plus 2 * 810 * 100, which is maximal possible theoretical void seed,
// which requires the cooldown to be zero.
// only 2309 checked seeds ended up discarded due to going over that limit - i do not know how many more should be discounted,
// but the average should be relatively resilient to this small over-allowance.
//
// previous estimates based on what i think is CDF, below:
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

function VMC_haveSeenGoldensYet() {
    return game.stats.goldenUpgrades.valueTotal > 0
}

function VMC_getZonesForEightGoldens() {
    // this should actually be Infinity when achieve bonus is less than 15%
    // but... i don't think its possible to hit z50 without 15% achieves
    // and this function shouldnt even be called then either, so... it defaults to Goldens-Every-Fifty
    if (game.global.achievementBonus < 100) {
        return 8 * 50; // 400
    } else if (game.global.achievementBonus < 300) {
        return 8 * 45; // 360
    } else if (game.global.achievementBonus < 600) {
        return 8 * 40; // 320
    } else if (game.global.achievementBonus < 1000) {
        return 8 * 35; // 280
    } else if (game.global.achievementBonus < 2000) {
        return 8 * 30; // 240
    } else if (game.global.achievementBonus >= 2000 + (500 * 8)) { // 6000
        return 0; // start with 8 or more Goldens! (very snazzy)
    } else { // start with between 0 and 7 goldens (inclusive)
        // 200 zones, OR less by 25 for every 500 extra achievebonus:
        let extra_goldens = Math.floor((game.global.achievementBonus - 2000) / 500);
        return 25 * (8 - extra_goldens);
    }
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
    //* new version, with number-of-zones-to-get (with value judgements? :/ hmmm)
    let num_zones_to_get_eight_voids = VMC_getZonesForEightGoldens();
    if (num_zones_to_get_eight_voids == 0) {
        if (game.goldenUpgrades.Void.currentBonus < 0.72) {
            varianceText += `You could get all 8 golden voids immediately on portal, allowing you unhindered access to this bonus.`
        }
    } else if (num_zones_to_get_eight_voids > game.global.highestLevelCleared) {
        varianceText += `However, acquiring all 8 golden voids would require clearing ` + prettify(num_zones_to_get_eight_voids)
        varianceText += ` zones, which is ...problematic.`
    } else {
        varianceText += `Note: acquiring all 8 golden voids requires clearing ` + prettify(num_zones_to_get_eight_voids)
        varianceText += ` zones, which will decrease their effectiveness.`
    }
    //*/
    /* old version, with percentage boost
    let difference_in_percentage = ((VMC_getNoGoldenVMDropWait() / VMC_getFullGoldenVMDropWait()) * 100) - 100;
    varianceText += `Buying 8 golden voids means you`;
    if (game.goldenUpgrades.Void.currentBonus < 0.72) {
        varianceText += ` would`;
    }
    varianceText += ` get void maps about `;
    varianceText += `<b>` + prettify(difference_in_percentage) + `%</b> faster.`;
    //*/
    return varianceText
}

function VMC_getShieldloomVarianceText() {
    let varianceText = '';
    let current_vmdc = VMC_getShieldVMDC_current_decimal();
    let current_max = VMC_getShieldVMDC_max_decimal();
    let maxrarity_max = VMC_getMaxRarityVMDC_max_decimal();
    if (current_vmdc > current_max) {
        // can improve shield
        varianceText += `With a shield of currently equipped rarity with maxed VMDC, your estimated cells-per-void-map would be `
        varianceText += VMC_getMaximisedCurrentExpectedVMWait() + `.`
    }
    if (VMC_currentRarityRangeHasHigherVMDCCap()) {
        // can up rarity with higher VMDC cap! (ouch)
        varianceText += `If you got the new rarity of shield with maxed VMDC, your estimated cells-per-void-map would be `
        varianceText += VMC_getMaxRarityMaxVMDCExpectedVMWait() + `. `
        if (VMC_getMaxRarity_isAtHazThreshhold()) {
            // technically a "downgrade"
            varianceText += `, but with additional gains apart from the main drop mechanism. <em>This <b>is</b> a stronger version of VMDC</em>. `
        }
    }
    if (current_vmdc < 1) {
        // can worsen shield
        varianceText += `Without your current shield, your estimated cells-per-void-map would be ` + VMC_getNoShieldExpectedVMWait()
        if (game.global.ShieldEquipped.rarity >= 10) {
            varianceText += `,  and also without the free void map per 1000 cells cleared (which `
            varianceText += `will drop the next one in ` + (1000 - game.global.hazShieldCredit) + ` cells).`;
        } else {
            varianceText += '.';
        }
    }

    return varianceText
}

function VMC_makeStringForDisplay() {
    if (game.global.totalPortals < 1) { // we have never yet portalled
        return '???';
    }
    if (game.global.universe == 2 && game.global.totalRadPortals < 1) { // we have reached u2, but haven't portalled there
        return 'N/A';
    }

    if (game.stats.totalVoidMaps.valueTotal + game.stats.totalVoidMaps.value < 1) { // have not cleared any void maps
        if (game.global.lastVoidMap >= (100 * game.global.world)) { // AND we haven't seen a map drop yet this run
            return game.global.lastVoidMap + "<br\>/ ???"; // then we should have no idea how long they take to drop
        }
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
    if (expectedBasicVoidsThisRun >= 10) {
        // when there are few voids expected, this showing partials is good.
        // however, that last partial is more than we actually expect, so we should not show it when it isn't a large fraction of the voids we're getting
        expectedBasicVoidsThisRun = Math.floor(expectedBasicVoidsThisRun)
    }

    let voidmapPermaBonus = game.permaBoneBonuses.voidMaps.owned;
    let netBoneVoidsBoost = (100 + voidmapPermaBonus) / 100;

    let totalnetVoidMapEstimate = netBoneVoidsBoost * (expectedBasicVoidsThisRun);
    return totalnetVoidMapEstimate;
}

function VMC_getCurrentGuaranteedVoids() {
    let currentCellTotal = (game.stats.zonesCleared.value * 100) + game.global.lastClearedCell;
    let expectedHazVoidsThisRun = 0;
    if (game.global.ShieldEquipped && game.global.ShieldEquipped.rarity >= 10 && game.heirlooms.Shield.voidMaps.currentBonus > 0) {
        expectedHazVoidsThisRun = currentCellTotal / 1000
        // we do not actually expect to get these early, at all. so we do not count the partially-earned.
        expectedHazVoidsThisRun = Math.floor(expectedHazVoidsThisRun)
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
        if (Fluffy.isRewardActive('evenMoreVoid')) {
            petVoidCount = Math.floor( Math.floor(game.stats.mostU2Voids.valueTotal / 5) * 1.5 );
        } else {
            petVoidCount = Math.floor(game.global.lastU2Voids / 5)
        } 
    }

    let voidmapPermaBonus = game.permaBoneBonuses.voidMaps.owned;
    let netBoneVoidsBoost = (100 + voidmapPermaBonus) / 100;
    return netBoneVoidsBoost * (voidspecVoidCount + petVoidCount + expectedHazVoidsThisRun);
}

function VMC_stringifyCurrentBoneBonusTimer() {
    let current_tracker_moment = game.permaBoneBonuses.voidMaps.tracker;
    let current_number_owned = game.permaBoneBonuses.voidMaps.owned;
    if (current_number_owned == 0) {
        return ''
    }
    let drops_until_next_double = Math.ceil((100 - current_tracker_moment) / current_number_owned);
    if (drops_until_next_double <= 1) {
        return 'Your next void map drop will be duplicated!'
    }
    let returntext = 'Your next duplicated void map drop is <b>' + drops_until_next_double + '</b> drops away.';
    return returntext
}

function VMC_populateVoidMapTooltip() {
    if (usingRealTimeOffline == true) {
      return '';
    }
    if (game.global.totalPortals < 1) { // have not yet portalled
        return "tooltip('A Secret Tool for Later', 'customText', event, '<p>This is little box will be relevant later, but do not worry about it for now."
            + " It is mostly just showing up here already to confirm that the mod has loaded.</p>"
            + "<p>Have fun exploring the game!</p>')";
    }
    if ((game.stats.totalVoidMaps.valueTotal < 1)) { // have not cleared any voids on previous runs
        if (VMC_getCurrentTotalVoids() > 1) { // have obtained or cleared any voids this run
            return "tooltip('A Secret Tool for Voids', 'customText', event, `<p>Well, your itch has proven connected to this weirdness called a Void Map."
                 + " Another one is out there, it seems, but far away. Far enough to not feel very relevant... but if you need it, you can sense its distance"
                 + " with all the vagueness you felt about the first one. With a bit more time, you can probably get a really good grasp on this itch.</p>"
                 + "<p>Have fun exploring the game! You're getting the hang of this! :)</p>`)";
        } else if (VMC_getCurrentVMDropCooldown() < game.global.lastVoidMap) { // have chance to get (first) void every world cell
            let chance = (Math.floor((game.global.lastVoidMap - VMC_getCurrentVMDropCooldown()) / 10) / 50000) * 100
            return "tooltip('A Secret Tool for Later', 'customText', event, '<p>The supposedly Nice thing seems like it is approaching. Some itch suggests it currently has a "
                 + prettify(chance) + "% chance to show up every time you kill an enemy? ...It might be nice if odd itches came with an instruction manual.</p>"
                 + "<p>Have fun exploring the game!</p>')";
        } else { // are still (implicitly) very early after first portal (or didn't clear any voids last portal)
            return "tooltip('A Secret Tool for Later', 'customText', event, '<p>You feel that there is something in your future which is going to be Nice..."
                 + " but you cannot tell for certain what, or even quite where, it is. Still, it seems to be getting closer with every enemy you defeat.</p>"
                 + "<p>Have fun exploring the game!</p>')";
        }
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
    if (VMC_haveSeenGoldensYet()) {
        tooltipstring += `<p>` + VMC_getGoldenVoidVarianceText() + `</p>`;
    }
    // if (have_bonus_voids_from_bones) {
    tooltipstring += `<p>` + VMC_stringifyCurrentBoneBonusTimer() + `</p>`;
    // }
    let currentTotalVoids = VMC_getCurrentTotalVoids()
    tooltipstring += `<p>You have gotten <b>` + currentTotalVoids + `</b> void maps total this run!`;
    let currentGuaranteedVoids = VMC_getCurrentGuaranteedVoids();
    if (currentGuaranteedVoids > 0) {
        let impliedRandomVoids = currentTotalVoids - currentGuaranteedVoids
        tooltipstring += ` Of these, around ` + prettify(currentGuaranteedVoids) + ` were guaranteed drops, and maybe ` + prettify(impliedRandomVoids) + ` were from the normal random system.`
    }
    tooltipstring += `</p>`;
    let a_bit_normal_version = VMC_getEstimateVoidsWithGivenWait(VMC_getCurrentExpectedVMWait());
    if (a_bit_normal_version >= 0.1) {
        tooltipstring += `<p>With your current <b>` + prettify(100 - Math.round(VMC_getCurrentVMDCeffect()*100)) + `%</b> VMDC,`
        tooltipstring += ` you would expect to have gotten something like <b>`
        tooltipstring += prettify(a_bit_normal_version) + `</b> random void maps.`;
        let a_bit_lucky_version = VMC_getEstimateVoidsWithGivenWait(VMC_getSomewhatLuckyVMWait());
        let a_bit_unlucky_version = VMC_getEstimateVoidsWithGivenWait(VMC_getSomewhatUnluckyVMWait());
        if (a_bit_lucky_version != a_bit_unlucky_version) {
            tooltipstring += ` However, anywhere from ` + prettify(a_bit_unlucky_version) + ` to ` + prettify(a_bit_lucky_version) + ` are within 10% (calculated) odds.`
        } else {
            // i don't honestly think this will show up? but who the heck knows.
            tooltipstring += ` This seems to be a very confident prediction, within 10% odds in both directions.`
        }
        tooltipstring += ` (these numbers are likely very wrong if you switched heirlooms mid run. be not alarmed)</p>`;
    } else {
        tooltipstring += `<p>You currently have <b>` + prettify(100 - Math.round(VMC_getCurrentVMDCeffect()*100)) + `%</b> VMDC,`
        tooltipstring += ` and you have not progressed far enough to expect a void map at all. (you may want to switch to your VMDC shield, if you have one!)</p>`
    }
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
