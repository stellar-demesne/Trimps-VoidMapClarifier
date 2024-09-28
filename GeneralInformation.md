# The Mechanism of How Void Maps Drop:

Void Maps are dropped by a combined random-chance _and_ a constrained time delay system. You cannot get a new void map immediately after getting the last one, but you also cannot predict exactly when the next one will drop.

These systems are switched between perfectly continuously. If you pass beyond the time delay period and then switch away from your void map drop chance heirloom, you are seamlessly back in the (now longer) time delay period. Or, if you are slogging along through the natural time delay period and then switch to an heirloom with high void map drop chance, you can suddenly have significant chances to acquire a void map on each world cell you clear.

## The time delay portion of the drop mechanism:

The time delay period is a waiting period based on how many world zone cells you have cleared, and is calculated based on the zone you reached before you last portalled (your "portal-zone"), though this number is clamped to a minimum of zone 80 and a maximum of zone 200. For portal-zone 80 (and below), the time delay is **1000** cells; for portal-zone 200 (and above), the time delay is **2560**. For the intermediate portal-zones, it is a linear increase of 13 cells' waiting time per portal-zone above 80. This number is used up until you reach 25 zones below your portal-zone, at which point it instead calculates the time delay as if you portalled on your highest zone ever reached.
  
The time delay is modified, however, by the Void Map Drop Chance on Shield heirlooms and by the Golden Void upgrades, whether you have one or both. The time delay is _decreased_ by those percentages, so if you had a time delay of 1000 cells, and a 25% VMDC mod on your shield, then your time delay would act as if it were 750 cells. Or, if you had a time delay of 2000 (as if you had portalled on zone 157...almost), and a shield with 50% VMDC and 50% VMDC from golden voids, then you would have a practical time delay of only 500 cells, as both 50% modifiers independently halve the delay.

Golden Voids' bonus cannot exceed 72%, and shield heirlooms have a varying cap on VMDC based on rarity - some shields do, however, have a cap which is high enough to make the Golden Voids' bonus practically meaningless.

## The random chance portion of the drop mechanism:

Past the time delay portion, every ten world cells cleared contributes an additive 0.002% chance for a void map to drop from each world cell. After 8 zones (which is 800 cells), the chance would thus be at .16% per cell.

This is a very unreliable randomness - so many random chances, but at such initially small odds, means that it takes _quite a while_ for the void map to have a reasonable chance to drop, but it also means that despite it being theoretically possible for a void map to fail to drop for 500 zones of this random rolling phase, it is astronomically unlikely for a void map to drop later than 38 zones into the phase.

For hard theoretical numbers, a void map is as likely to drop before **837** cells of this phase as it is to drop after that point; a void map will drop before 105 cells 1% of the time, and after 2148 cells 1% of the time; before 719 cells 40% of the time, and after 960 cells 40% of the time.

However, it should also be noted that the _actual_ pseudorandomness that this uses is a fairly non-random function, and is known to generate streaks of both lucky and unlucky results.

## Some comments on strategies and implications:

The way that the time delay gets longer as one pushes past zone 80 (until one begins pushing past zone 200) might seem to imply that pushing to new highest zones is actually a net loss. However, those zones give some incredibly powerful benefits, and the delay per zone is not even significant: at its greatest effect, at the switch from portal-zone 80 to portal-zone 81, it will delay each void map by about _0.7%_, and each zone's effect tapers down to _0.3%_ at the portal-zone 199 to portal-zone 200 switch. Do not fear pushing.

Golden Voids are a significant boost to how many voids one can expect to get. However, when one's Achievement bonus is small, the time it takes to acquire all 8 Golden Voids weakens them dramatically, especially since the first 5 Golden Voids are not even giving half of the total boost yet. The rule of thumb is to not bother with Golden Voids until you have 2500% achievement percentage and are reaching zone 350 regularly - before then, the extra helium income from additional Golden Heliums will outweigh the extra helium from the additional void maps you (might) get.

With higher tiers of shield heirlooms, the cap on their Void Map Drop Chance mods increases to mathematically alarming numbers. At 80%, the mechanism is dominated by the random chance portion, but everything still ends up working properly. Above 95% or so, the shield is doing so much on its own that _Golden Voids stop being relevant_. If your shield has that much VMDC, stop buying Golden Voids, and instead invest those goldens elsewhere. They will have more effect there. ...They will have **any** effect there.

# Other Sources of Void Maps (with Obfuscated Spoilers)

Throughout the game, there are multiple ways of getting more Void Maps, through both deterministic means and through means which depend on the randomness inherent in the basic void map dropping mechanism. The following list has most of the spoilers scrubbed off, but proceed with caution unless you are okay with hintings of spoilers.

- An early source gives deterministically more void maps for every void map earned from _any_ source, capping out at 10% more voids overall.
- One source eventually gives a flat total of 20 additional void maps for free every portal.
- A certain pair of unlocks give a variable number of free immediate void maps on portal based on the zone you portalled from.
- Yet another source adds a mechanism by which guaranteed void maps drop for every so many zones cleared _on top of_ the basic dropping mechanism.
- One source, oddly enough, gives its own 20% VMDC as an _additive_ bonus on the Golden Voids, bringing that up to a possible 92% VMDC.
- Another source can give back 5% of the voids you cleared last portal.
