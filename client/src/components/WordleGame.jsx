import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const WORDS = [
  'ABYSS', 'ACRID', 'ADAGE', 'ALOFT', 'AMITY', 'APING', 'ARTSY', 'AXIOM', 'AZURE', 'BALMY', 
  'BANAL', 'BELIE', 'BERTH', 'BIGHT', 'BIPED', 'BLITHE', 'BONYA', 'BOISE', 'BROOK', 'BUXOM', 
  'CABAL', 'CANNY', 'CASTE', 'CHASM', 'CHIDE', 'CIRCA', 'CLEAT', 'CLOTD', 'CONCH', 'COVEN', 
  'COWER', 'COYLY', 'CRONE', 'CRYPT', 'CYNIC', 'DEITY', 'DEMUR', 'DEPOT', 'DIRGE', 'DROSS', 
  'DUCAT', 'EDICT', 'EERIE', 'EGRET', 'ELIDE', 'EPOCH', 'ETHOS', 'EVADE', 'EXULT', 'FACET', 
  'FARCE', 'FAUNA', 'FETID', 'FJORD', 'FLAIL', 'FLOUT', 'FLUTE', 'FORGO', 'FRAIL', 'FROWY', 
  'GAUZE', 'GAVEL', 'GIRTH', 'GLOAT', 'GLYPH', 'GNASH', 'GONER', 'GOURD', 'GRIME', 'GROIN', 
  'GUILD', 'GUILE', 'GUIRE', 'HAIKU', 'HAVOC', 'HEATH', 'HEAVE', 'HEIST', 'HOARY', 'HORDE', 
  'HOVEL', 'HUMUS', 'HYDRA', 'HYENA', 'IDYLL', 'INANE', 'INERT', 'INLET', 'IRATE', 'IVORY', 
  'JADED', 'JAUNT', 'JAZZY', 'JERKY', 'JOLLY', 'JOUST', 'JUNTO', 'KNEAD', 'KNOLL', 'KRONE', 
  'LAPSE', 'LEECH', 'LIBEL', 'LITHE', 'LURID', 'LYMPH', 'LYRIC', 'MANGE', 'MANOR', 'MAXIM', 
  'METRO', 'MIDST', 'MIRED', 'MIRTH', 'MISER', 'MOTIF', 'MURAL', 'MYRRH', 'NADIR', 'NAIVE', 
  'NASTY', 'NAVAL', 'NICHE', 'NIGHT', 'NOBLE', 'NOMAD', 'NORTH', 'NYMPH', 'OAKEN', 'OASIS', 
  'OBESE', 'OCCUR', 'OCEAN', 'OFFAL', 'OFTEN', 'OLDEN', 'OLIVE', 'OMENS', 'OMITS', 'ONION', 
  'ONSET', 'OPALS', 'OPERA', 'OPINE', 'OPIUM', 'OPTIC', 'ORBIT', 'ORDER', 'ORGAN', 'OTHER', 
  'OUGHT', 'OUNCE', 'OUTER', 'OVARY', 'OVATE', 'OVERT', 'OWNED', 'OWNER', 'OXIDE', 'OZONE', 
  'PADDY', 'PAGAN', 'PAINT', 'PALER', 'PALSY', 'PANEL', 'PANIC', 'PANSY', 'PAPAL', 'PAPER', 
  'PARER', 'PARKA', 'PARRY', 'PARSE', 'PARTY', 'PASTA', 'PASTE', 'PASTY', 'PATCH', 'PATIO', 
  'PATSY', 'PATTY', 'PAUSE', 'PAYEE', 'PEACH', 'PEARL', 'PEDAL', 'PEERS', 'PENAL', 'PENCE', 
  'PENNY', 'PERCH', 'PERIL', 'PERKY', 'PESKY', 'PESTY', 'PETAL', 'PETTY', 'PHASE', 'PHONE', 
  'PHLOX', 'PHOTO', 'PIANO', 'PICKY', 'PIECE', 'PIETY', 'PIGGY', 'PIKE', 'PILOT', 'PINCH', 
  'PINEY', 'PINKY', 'PINTO', 'PIPER', 'PIQUE', 'PITCH', 'PITHY', 'PIVOT', 'PIXEL', 'PIXIE', 
  'PLACE', 'PLAID', 'PLAIN', 'PLAIT', 'PLANE', 'PLANK', 'PLANT', 'PLATE', 'PLAZA', 'PLEAD', 
  'PLEAT', 'PLIED', 'PLIER', 'PLUCK', 'PLUMB', 'PLUME', 'PLUMP', 'PLUNK', 'PLUSH', 'POESY', 
  'POINT', 'POISE', 'POKER', 'POLAR', 'POLKA', 'POLYP', 'POOCH', 'POPPY', 'PORCH', 'POSER', 
  'POSIT', 'POSSE', 'POSTS', 'POUCH', 'POUND', 'POUTY', 'POWER', 'PRANK', 'PRAWN', 'PREEN', 
  'PRESS', 'PRICE', 'PRICK', 'PRIDE', 'PRIED', 'PRIME', 'PRIMO', 'PRINT', 'PRIOR', 'PRIZE', 
  'PROBE', 'PRONE', 'PRONG', 'PROOF', 'PROUD', 'PROVE', 'PROWL', 'PROXIM', 'PROXY', 'PRUDE', 
  'PRUNE', 'PSALM', 'PUBIC', 'PUDGY', 'PUFFY', 'PULLY', 'PULPY', 'PULSE', 'PUNCH', 'PUPAL', 
  'PUPIL', 'PUPPY', 'PUREE', 'PURER', 'PURGE', 'PURSE', 'PUSHY', 'PUTTY', 'PYGMY', 'QUACK', 
  'QUAIL', 'QUAKE', 'QUALM', 'QUART', 'QUASH', 'QUASI', 'QUEEN', 'QUEER', 'QUELL', 'QUERY', 
  'QUEST', 'QUEUE', 'QUICK', 'QUIET', 'QUILL', 'QUILT', 'QUINT', 'QUIRK', 'QUITE', 'QUOTA', 
  'QUOTE', 'QUOTH', 'RABBI', 'RABID', 'RACED', 'RACER', 'RADAR', 'RADII', 'RADIO', 'RADON', 
  'RAFTY', 'RAGEY', 'RAIDY', 'RAILY', 'RAISY', 'RAJAH', 'RAKED', 'RALLY', 'RAMEN', 'RANCH', 
  'RANDY', 'RANGE', 'RANKY', 'RANTS', 'RAPID', 'RARER', 'RASEY', 'RATED', 'RATIO', 'RATTY', 
  'RAVEN', 'RAYON', 'RAZOR', 'REACH', 'REACT', 'READS', 'READY', 'REALM', 'REALS', 'REARM', 
  'REARS', 'REAST', 'REBEL', 'REBUS', 'REBUT', 'RECAP', 'RECTO', 'RECUR', 'RECUT', 'REEDY', 
  'REEL', 'REELS', 'REEVE', 'REFED', 'REFER', 'REFIT', 'REGEL', 'REIFY', 'REIGN', 'REINK', 
  'REKEY', 'RELAX', 'RELAY', 'RELIC', 'RELIT', 'RELOX', 'REMAP', 'REMED', 'REMET', 'REMIX', 
  'RENAL', 'RENDS', 'RENEW', 'RENIG', 'RENIN', 'RENTS', 'REPAY', 'REPEL', 'REPLY', 'REPRO', 
  'RERAN', 'RERUN', 'RESAT', 'RESAW', 'RESEE', 'RESET', 'RESEW', 'RESID', 'RESIN', 'RESIT', 
  'RESOW', 'RESTY', 'RESUM', 'RETAG', 'RETAP', 'RETAX', 'RETCH', 'RETHI', 'RETIA', 'RETIE', 
  'RETIP', 'RETOX', 'RETRO', 'RETRY', 'REUSE', 'REVEL', 'REVET', 'REVUE', 'REWAN', 'REWAX', 
  'REWED', 'REWET', 'REWIN', 'REWON', 'REXEX', 'RHUMB', 'RHYME', 'RHYTA', 'RIANT', 'RIATA', 
  'RIBBY', 'RICED', 'RICER', 'RICES', 'RICEY', 'RICIN', 'RICKY', 'RIDER', 'RIDES', 'RIDGE', 
  'RIDGY', 'RIFER', 'RIFLE', 'RIFTS', 'RIFTY', 'RIGHT', 'RIGOR', 'RILED', 'RILES', 'RILEY', 
  'RILLS', 'RILLY', 'RIMED', 'RIMER', 'RIMES', 'RIMEY', 'RINDS', 'RINDY', 'RINGS', 'RINGY', 
  'RINKS', 'RINSE', 'RIOTS', 'RIPEN', 'RIPER', 'RIPES', 'RISEN', 'RISER', 'RISES', 'RISHI', 
  'RISKS', 'RISKY', 'RISUS', 'RITES', 'RITZY', 'RIVAL', 'RIVAS', 'RIVED', 'RIVEN', 'RIVER', 
  'RIVES', 'RIVET', 'RIYAL', 'ROACH', 'ROADS', 'ROAMY', 'ROANS', 'ROARS', 'ROAST', 'ROBED', 
  'ROBES', 'ROBIN', 'ROBOT', 'ROCKS', 'ROCKY', 'RODEO', 'ROGER', 'ROGUE', 'ROILS', 'ROILY', 
  'ROLES', 'ROLFS', 'ROLLS', 'ROMAN', 'ROMEO', 'ROMPY', 'RONDO', 'RONDS', 'RONEE', 'RONGS', 
  'RONIN', 'RONNE', 'RONNY', 'ROODS', 'ROODY', 'ROOFS', 'ROOFY', 'ROOKS', 'ROOKY', 'ROOMS', 
  'ROOMY', 'ROOSE', 'ROOST', 'ROOTS', 'ROOTY', 'ROPED', 'ROPER', 'ROPES', 'ROPEY', 'ROQUE', 
  'RORAL', 'RORIC', 'RORTS', 'RORTY', 'ROSAL', 'ROSED', 'ROSES', 'ROSET', 'ROSEY', 'ROSIN', 
  'ROSTI', 'ROTAL', 'ROTAS', 'ROTCH', 'ROTED', 'ROTES', 'ROTIS', 'ROTOR', 'ROTOS', 'ROTOT', 
  'ROTTE', 'ROUGH', 'ROUND', 'ROUPS', 'ROUPY', 'ROUSE', 'ROUST', 'ROUTE', 'ROUTH', 'ROUTS', 
  'ROVED', 'ROVEN', 'ROVER', 'ROVES', 'ROWAN', 'ROWED', 'ROWEL', 'ROWEN', 'ROWER', 'ROWTH', 
  'ROYAL', 'RUANA', 'RUBBY', 'RUBEL', 'RUBES', 'RUBIN', 'RUBLE', 'RUBUS', 'RUCHE', 'RUCKS', 
  'RUDAS', 'RUDDS', 'RUDDY', 'RUDER', 'RUDES', 'RUDIE', 'RUDIS', 'RUEDA', 'RUERS', 'RUFFE', 
  'RUFFS', 'RUGAE', 'RUGAL', 'RUGBY', 'RUGER', 'RUGGS', 'RUGGY', 'RUING', 'RUINS', 'RULED', 
  'RULER', 'RULES', 'RUMBA', 'RUMEN', 'RUMES', 'RUMMY', 'RUMOR', 'RUMPS', 'RUMPY', 'RUNCH', 
  'RUNDS', 'RUNED', 'RUNES', 'RUNGS', 'RUNIC', 'RUNNY', 'RUNTS', 'RUNTY', 'RUPEE', 'RUPIA', 
  'RURAL', 'RURPS', 'RURRY', 'RUSA', 'RUSE', 'RUSES', 'RUSHY', 'RUSKS', 'RUSMA', 'RUSTS', 
  'RUSTY', 'RUTHS', 'RUTIN', 'RUTTY', 'RYALS', 'RYBAT', 'RYKED', 'RYKES', 'RYNDS', 'RYOLD', 
  'RYOTS', 'RYTHM', 'SABER', 'SABLE', 'SACHET', 'SADLY', 'SAINT', 'SALAD', 'SALON', 'SALSA', 
  'SALTS', 'SALTY', 'SALVE', 'SAMBA', 'SAME', 'SANER', 'SAPPY', 'SASSY', 'SATIN', 'SATIR', 
  'SAUCE', 'SAUCY', 'SAUNA', 'SAUTE', 'SAVED', 'SAVER', 'SAVES', 'SAVOR', 'SAVVY', 'SAWED', 
  'SAXON', 'SCALD', 'SCALE', 'SCALP', 'SCALY', 'SCAMP', 'SCANT', 'SCARE', 'SCARF', 'SCARP', 
  'SCARY', 'SCENE', 'SCENT', 'SCION', 'SCOFF', 'SCOLD', 'SCONE', 'SCOOP', 'SCOOT', 'SCOPE', 
  'SCORE', 'SCORN', 'SCOUR', 'SCOUT', 'SCOWL', 'SCRAM', 'SCRAP', 'SCREE', 'SCREW', 'SCRIM', 
  'SCRIP', 'SCROD', 'SCROG', 'SCRUB', 'SCUBA', 'SCUDO', 'SCUFF', 'SCULL', 'SCULP', 'SCUMY', 
  'SCUP', 'SCURF', 'SEDAN', 'SEDGE', 'SEDUM', 'SEEDY', 'SEEKS', 'SEELY', 'SEEPY', 'SEERS', 
  'SEGUE', 'SEIZE', 'SELAH', 'SELFS', 'SELLS', 'SEMEN', 'SEMES', 'SEMIS', 'SENDS', 'SENES', 
  'SENNA', 'SENOR', 'SENSE', 'SENSY', 'SENTI', 'SENTS', 'SEPAL', 'SEPIA', 'SEPOY', 'SEPTA', 
  'SEPTS', 'SERAL', 'SERED', 'SERER', 'SERES', 'SERFS', 'SERGE', 'SERIF', 'SERIN', 'SERKS', 
  'SERON', 'SEROW', 'SERPS', 'SERRA', 'SERRE', 'SERRS', 'SERRY', 'SERUM', 'SERVE', 'SERVO', 
  'SESEY', 'SESSA', 'SETER', 'SETTS', 'SETUP', 'SEVEN', 'SEVER', 'SEWAN', 'SEWAR', 'SEWED', 
  'SEWER', 'SEXED', 'SEXER', 'SEXES', 'SEXTO', 'SEXTS', 'SHACK', 'SHADE', 'SHADY', 'SHAFT', 
  'SHAKE', 'SHAKO', 'SHAKY', 'SHALE', 'SHALL', 'SHALT', 'SHAME', 'SHAMS', 'SHANK', 'SHANS', 
  'SHAPE', 'SHARD', 'SHARE', 'SHARK', 'SHARN', 'SHARP', 'SHASH', 'SHAVE', 'SHAWL', 'SHAWN', 
  'SHAWS', 'SHAYS', 'SHEAF', 'SHEAL', 'SHEAR', 'SHEAS', 'SHEDS', 'SHEEL', 'SHEEN', 'SHEEP', 
  'SHEER', 'SHEET', 'SHEIK', 'SHELF', 'SHELL', 'SHEND', 'SHENT', 'SHEOL', 'SHERD', 'SHERE', 
  'SHERO', 'SHETS', 'SHEVA', 'SHEWS', 'SHIED', 'SHIER', 'SHIES', 'SHIFT', 'SHILL', 'SHILY', 
  'SHIMY', 'SHIND', 'SHINE', 'SHINS', 'SHINY', 'SHIPS', 'SHIRE', 'SHIRK', 'SHIRR', 'SHIRT', 
  'SHIST', 'SHITS', 'SHIVA', 'SHIVE', 'SHIVS', 'SHLEP', 'SHLUB', 'SHMEAR', 'SHMOE', 'SHOAL', 
  'SHOAT', 'SHOCK', 'SHOED', 'SHOER', 'SHOES', 'SHOGI', 'SHOGS', 'SHONE', 'SHOOK', 'SHOOL', 
  'SHOON', 'SHOOS', 'SHOOT', 'SHOPS', 'SHORE', 'SHORL', 'SHORN', 'SHORT', 'SHOTE', 'SHOTS', 
  'SHOTT', 'SHOUT', 'SHOVE', 'SHOWD', 'SHOWN', 'SHOWS', 'SHOWY', 'SHRANK', 'SHRED', 'SHREW', 
  'SHRIS', 'SHROW', 'SHRUB', 'SHRUG', 'SHRUNK', 'SHTIK', 'SHTUM', 'SHUCK', 'SHULE', 'SHULN', 
  'SHULS', 'SHUNT', 'SHURA', 'SHUSH', 'SHUTE', 'SHUTS', 'SHWAS', 'SHYER', 'SHYLY', 'SIBB', 
  'SIBYL', 'SICE', 'SICKO', 'SICKS', 'SIDAL', 'SIDAS', 'SIDED', 'SIDER', 'SIDES', 'SIDHE', 
  'SIDLE', 'SIEGE', 'SIELD', 'SIENS', 'SIENT', 'SIETH', 'SIEVER', 'SIEVES', 'SIFTS', 'SIGHT', 
  'SIGIL', 'SIGLA', 'SIGMA', 'SIGNS', 'SIKHS', 'SIKRA', 'SILD', 'SILE', 'SILK', 'SILKS', 
  'SILKY', 'SILL', 'SILLS', 'SILLY', 'SILO', 'SILOS', 'SILT', 'SILTS', 'SILTY', 'SILVA', 
  'SIMAR', 'SIMAS', 'SIME', 'SIMIS', 'SIMP', 'SIMPS', 'SINCE', 'SINDS', 'SINED', 'SINES', 
  'SINEW', 'SINGE', 'SINGS', 'SINH', 'SINHS', 'SINKS', 'SINKY', 'SINNED', 'SINNER', 'SINNS', 
  'SINUS', 'SIPED', 'SIPES', 'SIPPI', 'SIRED', 'SIREE', 'SIREN', 'SIRES', 'SIRRA', 'SIRRI', 
  'SIRUP', 'SISAL', 'SISES', 'SISSY', 'SITAR', 'SITED', 'SITES', 'SITHE', 'SITKA', 'SITUP', 
  'SITUS', 'SIVER', 'SIXES', 'SIXMO', 'SIXTE', 'SIXTH', 'SIXTY', 'SIZAR', 'SIZED', 'SIZER', 
  'SIZES', 'SIZY', 'SKALD', 'SKANK', 'SKATE', 'SKATS', 'SKEAN', 'SKEE', 'SKEED', 'SKEEN', 
  'SKEER', 'SKEES', 'SKEET', 'SKEGG', 'SKEGS', 'SKEIN', 'SKELF', 'SKELL', 'SKELLY', 'SKELP', 
  'SKENE', 'SKENS', 'SKER', 'SKERRY', 'SKETS', 'SKEW', 'SKEWS', 'SKID', 'SKIDS', 'SKIED', 
  'SKIER', 'SKIES', 'SKIEY', 'SKIFF', 'SKILL', 'SKILLS', 'SKILLY', 'SKIMO', 'SKIMP', 'SKIMS', 
  'SKINER', 'SKINK', 'SKINS', 'SKINT', 'SKIPS', 'SKIRL', 'SKIRM', 'SKIRT', 'SKITS', 'SKIVE', 
  'SKIVY', 'SKUA', 'SKUL', 'SKULL', 'SKUNK', 'SKYED', 'SKYER', 'SKYEY', 'SKYLE', 'SLAB', 
  'SLABS', 'SLACK', 'SLADE', 'SLAGS', 'SLAIN', 'SLAKE', 'SLAMS', 'SLANG', 'SLANK', 'SLANT', 
  'SLAP', 'SLAPS', 'SLASH', 'SLAT', 'SLATE', 'SLATS', 'SLATY', 'SLAVE', 'SLAWS', 'SLAYS', 
  'SLEAVE', 'SLEAZE', 'SLEAZY', 'SLED', 'SLEDS', 'SLEEK', 'SLEEP', 'SLEEPS', 'SLEEPY', 
  'SLEER', 'SLEET', 'SLEETS', 'SLEETY', 'SLEEVE', 'SLEIGH', 'SLEIGHT', 'SLENDER', 'SLEW', 
  'SLEWS', 'SLICE', 'SLICER', 'SLICES', 'SLICK', 'SLID', 'SLIDE', 'SLIDER', 'SLIDES', 'SLIGHT', 
  'SLIM', 'SLIME', 'SLIMES', 'SLIMLY', 'SLIMMY', 'SLIMNESS', 'SLIMS', 'SLIMY', 'SLING', 
  'SLINK', 'SLIP', 'SLIPS', 'SLIPT', 'SLIT', 'SLITS', 'SLIVE', 'SLIVER', 'SLOE', 'SLOG', 
  'SLOGS', 'SLOOP', 'SLOP', 'SLOPE', 'SLOPES', 'SLOPPY', 'SLOSH', 'SLOT', 'SLOTS', 'SLOW', 
  'SLOWS', 'SLUDGE', 'SLUDGY', 'SLUE', 'SLUES', 'SLUFF', 'SLUG', 'SLUGS', 'SLUICE', 'SLUM', 
  'SLUMP', 'SLUR', 'SLURP', 'SLURS', 'SLUSH', 'SLUSHY', 'SLUT', 'SLYLY', 'SMACK', 'SMALL', 
  'SMALLS', 'SMART', 'SMARTS', 'SMASH', 'SMEAR', 'SMEARS', 'SMEARY', 'SMELL', 'SMELLS', 
  'SMELLY', 'SMELT', 'SMELTED', 'SMELTER', 'SMILE', 'SMILER', 'SMILES', 'SMILEY', 'SMIRK', 
  'SMIRKS', 'SMIRKY', 'SMITE', 'SMITH', 'SMITHER', 'SMITHS', 'SMITHY', 'SMOCK', 'SMOCKS', 
  'SMOKE', 'SMOKED', 'SMOKER', 'SMOKES', 'SMOKEY', 'SMOKY', 'SMOLT', 'SMOLTS', 'SMOOTH', 
  'SMOTE', 'SMOTHER', 'SMUDGE', 'SMUDGY', 'SMUG', 'SMUGGLY', 'SMUT', 'SNAIL', 'SNAKE', 
  'SNAKES', 'SNAKY', 'SNAP', 'SNAPS', 'SNARE', 'SNARES', 'SNARL', 'SNARLS', 'SNATCH', 
  'SNEAK', 'SNEAKS', 'SNEAKY', 'SNEER', 'SNEERS', 'SNEEZE', 'SNEEZY', 'SNIFF', 'SNIFFLE', 
  'SNIK', 'SNIP', 'SNIPE', 'SNIPES', 'SNIPS', 'SNIVEL', 'SNOB', 'SNOOT', 'SNOOZE', 'SNORE', 
  'SNORES', 'SNORT', 'SNORTS', 'SNOT', 'SNOTS', 'SNOTTY', 'SNOUT', 'SNOW', 'SNOWS', 'SNOWY', 
  'SNUB', 'SNUCK', 'SNUFF', 'SNUG', 'SOAK', 'SOAKS', 'SOAP', 'SOAPS', 'SOAPY', 'SOAR', 
  'SOARS', 'SOB', 'SOBS', 'SOBER', 'SOCCER', 'SOCK', 'SOCKS', 'SODA', 'SODAS', 'SODIUM', 
  'SOFA', 'SOFAS', 'SOFT', 'SOFTEN', 'SOFTLY', 'SOFTNESS', 'SOFTS', 'SOFTY', 'SOIL', 
  'SOILS', 'SOLAR', 'SOLD', 'SOLDER', 'SOLE', 'SOLES', 'SOLELY', 'SOLVE', 'SOLVED', 
  'SOLVER', 'SOLVES', 'SOLVING', 'SOME', 'SONAR', 'SONG', 'SONGS', 'SONNET', 'SOON', 
  'SOOT', 'SOOTY', 'SORE', 'SORES', 'SORELY', 'SORRY', 'SORT', 'SORTS', 'SOUGHT', 'SOUL', 
  'SOULS', 'SOUND', 'SOUNDS', 'SOUP', 'SOUPS', 'SOUPY', 'SOUR', 'SOURS', 'SOURCE', 
  'SOURCES', 'SOUTH', 'SPACE', 'SPACER', 'SPACES', 'SPACEY', 'SPACY', 'SPADE', 'SPADES', 
  'SPAKE', 'SPAM', 'SPAMS', 'SPANK', 'SPANKY', 'SPAR', 'SPARE', 'SPARES', 'SPARK', 'SPARKS', 
  'SPARKY', 'SPARROW', 'PARSE', 'SPASM', 'SPASMS', 'SPAT', 'SPATS', 'SPAWN', 'SPAWNS', 
  'SPEAK', 'SPEAKER', 'SPEAKS', 'SPEAR', 'SPEARS', 'SPECIAL', 'SPECIES', 'SPECIFY', 
  'SPEED', 'SPEEDER', 'SPEEDS', 'SPEEDY', 'SPELL', 'SPELLS', 'SPEND', 'SPENDS', 'SPENT', 
  'SPHERE', 'SPHERES', 'SPHINX', 'SPICE', 'SPICER', 'SPICES', 'SPICEY', 'SPICY', 'SPIDER', 
  'SPIDERS', 'SPIDERY', 'SPIKE', 'SPIKES', 'SPIKY', 'SPILL', 'SPILLS', 'SPIN', 'SPINDLE', 
  'SPINE', 'SPINES', 'SPINET', 'SPINNEY', 'SPINNING', 'SPINS', 'SPINY', 'SPIRAL', 'SPIRALS', 
  'SPIRIT', 'SPIRITS', 'SPIT', 'SPITE', 'SPITS', 'SPLASH', 'SPLAT', 'SPLAY', 'SPLEND', 
  'SPLINT', 'SPLIT', 'SPLITS', 'SPOIL', 'SPOILS', 'SPOKE', 'SPOKEN', 'SPOKES', 'SPONGE', 
  'SPONGY', 'SPOOK', 'SPOOKS', 'SPOOKY', 'SPOOL', 'SPOOLS', 'SPOON', 'SPOONS', 'SPOONY', 
  'SPORE', 'SPORES', 'SPORT', 'SPORTS', 'SPORTY', 'SPOT', 'SPOTS', 'SPOTTED', 'SPOTTY', 
  'SPOUSE', 'SPOUSES', 'SPOUT', 'SPOUTS', 'SPRAIN', 'SPRAINS', 'SPRANG', 'SPRAT', 'SPRATS', 
  'SPRAWL', 'SPRAY', 'SPRAYS', 'SPREAD', 'SPREADS', 'SPREE', 'SPREES', 'SPRIG', 'SPRIGS', 
  'SPRING', 'SPRINGS', 'SPRINGY', 'SPRINT', 'SPRINTS', 'SPRITE', 'SPRITES', 'SPROUT', 
  'SPROUTS', 'SPRUCE', 'SPRUCES', 'SPRUCY', 'SPRUNG', 'SPRY', 'SPRYNESS', 'SPUE', 'SPUES', 
  'SPUG', 'SPUGS', 'SPUN', 'SPUNK', 'SPUNKY', 'SPUR', 'SPURS', 'SPURT', 'SPURTS', 'SPUTUM', 
  'SPY', 'SPYS', 'SQUAB', 'SQUABS', 'SQUAD', 'SQUADS', 'SQUALID', 'SQUALL', 'SQUALLS', 
  'SQUALOR', 'SQUARE', 'SQUARES', 'SQUASH', 'SQUASHY', 'SQUAT', 'SQUATS', 'SQUAW', 'SQUAWS', 
  'SQUEAK', 'SQUEAKY', 'SQUEAL', 'SQUEALS', 'SQUEE', 'SQUEEZE', 'SQUELCH', 'SQUELCHY', 
  'SQUINT', 'SQUINTS', 'SQUINTY', 'SQUIRE', 'SQUIRES', 'SQUIRM', 'SQUIRMS', 'SQUIRMY', 'SYLPH', 
  'TOPAZ', 'UNZIP', 'VEXED', 'WALTZ', 'XYLEM', 'YACHT', 'ZESTY', 'ZENITH',
  'QOPHS', 'ZARFS', 'XYSTS', 'VROUW', 'SNEES', 'ROUES', 'QUIPS', 'PIQUE', 
  'FJORD', 'FETID', 'DROSS', 'CHASM', 'CABAL', 'BANAL', 'AZURE', 'BALMY', 
  'BELIE', 'BERTH', 'BIGHT', 'BIPED', 'BLITHE', 'BUXOM', 'CANNY', 'CASTE', 
  'CHIDE', 'CIRCA', 'CLEAT', 'CONCH', 'COVEN', 'COWER', 'COYLY', 'CRONE', 
  'CRYPT', 'CYNIC', 'DEITY', 'DEMUR', 'DEPOT', 'DIRGE', 'DUCAT', 'EDICT', 
  'EERIE', 'EGRET', 'ELIDE', 'EPOCH', 'ETHOS', 'EVADE', 'EXULT', 'FACET', 
  'FARCE', 'FAUNA', 'FLAIL', 'FLOUT', 'GAUZE', 'GAVEL', 'GIRTH', 'GLOAT', 
  'GLYPH', 'GNASH', 'GOURD', 'GRIME', 'GROIN', 'GUILD', 'GUILE', 'HAIKU', 
  'HAVOC', 'HEATH', 'HEAVE', 'HEIST', 'HOARY', 'HORDE', 'HOVEL', 'HUMUS', 
  'HYDRA', 'HYENA', 'IDYLL', 'INANE', 'INERT', 'INLET', 'IRATE', 'JADED', 
  'JAUNT', 'JUNTO', 'KNEAD', 'KNOLL', 'KRONE', 'LAPSE', 'LEECH', 'LIBEL', 
  'LITHE', 'LURID', 'LYMPH', 'MANGE', 'MANOR', 'MAXIM', 'MIDST', 'MIRED', 
  'MIRTH', 'MISER', 'MOTIF', 'MURAL', 'MYRRH', 'NADIR', 'NICHE', 'NOMAD', 
  'NYMPH', 'OFFAL', 'OPINE', 'PHLOX', 'PIETY', 'PITHY', 'POSER', 'POSIT', 
  'PRAWN', 'PREEN', 'PUFFY', 'PUPAL', 'PYGMY', 'QUACK', 'QUAIL', 'QUAKE', 
  'QUALM', 'QUASH', 'QUASI', 'QUEER', 'QUELL', 'QUERY', 'QUEST', 'QUEUE', 
  'QUICK', 'QUIET', 'QUILL', 'QUILT', 'QUINT', 'QUIRK', 'QUITE', 'QUOTA', 
  'QUOTE', 'QUOTH', 'SYLPH'
];
const WORD_LENGTH = 5;
const MAX_GUESSES = 5;

export default function WordleGame({ onWin, onLose }) {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    setTargetWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (gameOver) return;

      if (e.key === 'Enter') {
        if (currentGuess.length !== WORD_LENGTH) return;
        
        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        setCurrentGuess('');

        if (currentGuess === targetWord) {
          setGameOver(true);
          setTimeout(onWin, 1500);
        } else if (newGuesses.length >= MAX_GUESSES) {
          setGameOver(true);
          setTimeout(() => {
            setGuesses([]);
            setCurrentGuess('');
            setGameOver(false);
            setTargetWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
            if (onLose) onLose();
          }, 2500);
        }
      } else if (e.key === 'Backspace') {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess((prev) => (prev + e.key).toUpperCase());
        }
      }
    },
    [currentGuess, gameOver, guesses, targetWord, onWin, onLose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const evaluateGuess = (guess) => {
    const result = Array(WORD_LENGTH).fill('gray');
    const targetChars = targetWord.split('');
    const guessChars = guess.split('');

    // First pass: locate exact matches (green)
    guessChars.forEach((char, i) => {
      if (targetChars[i] === char) {
        result[i] = 'green';
        targetChars[i] = null; // Mark as used
        guessChars[i] = null;
      }
    });

    // Second pass: locate partial matches (yellow)
    guessChars.forEach((char, i) => {
      if (char !== null && targetChars.includes(char)) {
        result[i] = 'yellow';
        targetChars[targetChars.indexOf(char)] = null;
      }
    });

    return result;
  };

  const rows = [];
  for (let i = 0; i < MAX_GUESSES; i++) {
    if (i < guesses.length) {
      // Completed row
      const evaluations = evaluateGuess(guesses[i]);
      rows.push(
        <div key={i} className="flex gap-2 justify-center mb-2">
          {guesses[i].split('').map((char, j) => {
            const status = evaluations[j];
            let bgColor = 'bg-mono-50';
            let textColor = 'text-mono-950';
            if (status === 'green') {
              bgColor = 'bg-green-500';
              textColor = 'text-white';
            } else if (status === 'yellow') {
              bgColor = 'bg-yellow-400';
              textColor = 'text-mono-950';
            } else if (status === 'gray') {
              bgColor = 'bg-mono-300';
              textColor = 'text-white';
            }
            return (
              <motion.div
                key={j}
                initial={{ rotateX: -90 }}
                animate={{ rotateX: 0 }}
                transition={{ delay: j * 0.1, duration: 0.3 }}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-black text-lg sm:text-xl border-2 border-mono-950 ${bgColor} ${textColor} uppercase`}
              >
                {char}
              </motion.div>
            );
          })}
        </div>
      );
    } else if (i === guesses.length) {
      // Current active row
      const emptyCells = Array(WORD_LENGTH - currentGuess.length).fill('');
      rows.push(
        <div key={i} className="flex gap-2 justify-center mb-2">
          {currentGuess.split('').map((char, j) => (
            <div key={j} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-black text-lg sm:text-xl border-2 border-mono-950 bg-mono-100 text-mono-950 uppercase shadow-[2px_2px_0_0_#3f3f46]">
              {char}
            </div>
          ))}
          {emptyCells.map((_, j) => (
            <div key={`empty-${j}`} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-mono-300 bg-transparent"></div>
          ))}
        </div>
      );
    } else {
      // Empty future rows
      rows.push(
        <div key={i} className="flex gap-2 justify-center mb-2">
          {Array(WORD_LENGTH).fill('').map((_, j) => (
            <div key={`blank-${j}`} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-mono-200 bg-transparent"></div>
          ))}
        </div>
      );
    }
  }

  // Virtual Keyboard Data
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
  ];

  const handleVirtualKey = (key) => {
    if (key === 'ENTER') handleKeyDown({ key: 'Enter' });
    else if (key === '⌫') handleKeyDown({ key: 'Backspace' });
    else handleKeyDown({ key });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6">
        {rows}
      </div>

      {gameOver && guesses.includes(targetWord) && (
        <p className="text-[10px] font-black text-green-600 mb-6 uppercase tracking-widest animate-pulse">
          ACCESS CODE ACCEPTED.
        </p>
      )}

      {gameOver && !guesses.includes(targetWord) && (
        <p className="text-[10px] font-black text-red-600 mb-6 uppercase tracking-widest animate-pulse">
          TARGET WAS "{targetWord}". RESTARTING PARADIGM.
        </p>
      )}
      
      {/* Virtual Keyboard */}
      <div className="flex flex-col gap-1 w-full max-w-full sm:max-w-[320px]">
        {keyboardRows.map((row, i) => (
          <div key={i} className="flex gap-1 justify-center">
            {row.map(key => {
              // Determine if key was guessed
              let keyBg = 'bg-mono-200';
              let keyText = 'text-mono-950';

              guesses.forEach(g => {
                const evaluations = evaluateGuess(g);
                g.split('').forEach((char, idx) => {
                  if (char === key) {
                    if (evaluations[idx] === 'green') {
                      keyBg = 'bg-green-500';
                      keyText = 'text-white';
                    } else if (evaluations[idx] === 'yellow' && keyBg !== 'bg-green-500') {
                      keyBg = 'bg-yellow-400';
                      keyText = 'text-mono-950';
                    } else if (evaluations[idx] === 'gray' && keyBg === 'bg-mono-200') {
                      keyBg = 'bg-mono-400';
                      keyText = 'text-mono-100';
                    }
                  }
                });
              });

              const isAction = key === 'ENTER' || key === '⌫';

              return (
                <button
                  key={key}
                  onClick={() => handleVirtualKey(key)}
                  className={`h-9 sm:h-10 text-[9px] sm:text-[10px] font-black border-2 border-mono-950 flex items-center justify-center transition-colors active:translate-y-px 
                    ${isAction ? 'px-1 sm:px-2 min-w-[2.5rem] sm:min-w-[3rem]' : 'flex-1'}
                    ${keyBg} ${keyText}
                  `}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      
      <p className="text-[8px] text-mono-400 mt-6 font-bold uppercase tracking-[0.3em]">
        PHYSICAL KEYBOARD DETECTED
      </p>
    </div>
  );
}
