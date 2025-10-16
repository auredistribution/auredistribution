// Division color mapping for Australian redistribution tool

function getColor(division) { // same mapping as original
  switch (division) {
    case "SPLIT":
      return { color: "white" };
    case "Warrego":
    case "Ferny Grove":
    case "Capricornia":
    case "Wyong":
    case "Winston Hills":
      return { color: "silver" };
    case "Gregory":
    case "Cooper":
    case "Herbert":
    case "Swan Hills":
    case "Wollondilly":
    case "Wollongong":
      return { color: "darkslategray" };
    case "Traeger":
    case "Maiwar":
    case "Paddington":
    case "Kennedy":
    case "Albany":
    case "Thornlie":
    case "Aston":
    case "Albert Park":
    case "Melton":
    case "Derwent":
    case "Albury":
    case "Auburn":
      return { color: "darkolivegreen" };
    case "Cook":
    case "Moggill":
    case "Leichhardt":
    case "Bracken Ridge":
    case "Bass":
    case "Armadale":
    case "Vasse":
    case "Ballarat":
    case "Ashwood":
    case "Mildura":
    case "Bayswater":
    case "Elwick":
    case "Badgerys Creek":
    case "Ballina":
      return { color: "sienna" };
    case "Barron River":
    case "Ipswich West":
    case "Dawson":
    case "Deagon":
    case "Braddon":
    case "Balcata":
    case "Victoria Park":
    case "Bendigo":
    case "Mill Park":
    case "Mordialloc":
    case "Monbulk":
    case "Hobart":
    case "Balmain":
    case "Bankstown":
      return { color: "seagreen" };
    case "Cairns":
    case "Ipswich":
    case "Flynn":
    case "Adelaide":
    case "Northgate":
    case "Lyons":
    case "Bean":
    case "Baldivis":
    case "Wanneroo":
    case "Bruce":
    case "Bellarine":
    case "Huon":
    case "Barwon":
    case "Bathurst":
      return { color: "midnightblue" };
    case "Mulgrave":
    case "Bundamba":
    case "Hinkler":
    case "Hindmarsh":
    case "Hamilton":
    case "Clark":
    case "Canberra":
    case "Bassendean":
    case "Secret Harbour":
    case "Calwell":
    case "Benambra":
    case "Launceston":
    case "Bega":
    case "Blacktown":
      return { color: "darkred" };
    case "Hill":
    case "Jordan":
    case "Wide Bay":
    case "McDowall":
    case "Sturt":
    case "Franklin":
    case "Fenner":
    case "Bateman":
    case "Warren-Blackwood":
    case "Casey":
    case "Bendigo East":
    case "Mornington":
    case "McIntyre":
    case "Blue Mountains":
    case "Camden":
    case "Cabramatta":
      return { color: "olive" };
    case "Hinchinbrook":
    case "Inala":
    case "Marchant":
    case "Groom":
    case "Boothby":
    case "West Swan":
    case "Chisholm":
    case "Bendigo West":
    case "Morwell":
    case "Mersey":
    case "Campbelltown":
      return { color: "lightslategray" };
    case "Thuringowa":
    case "Mount Ommaney":
    case "Enoggera":
    case "Maranoa":
    case "Kingston":
    case "Bicton":
    case "Bibra Lake":
    case "Kalgoorlie":
    case "Cooper":
    case "Murray Plains":
    case "Montgomery":
    case "Canterbury":
    case "Castle Hill":
      return { color: "green" };
    case "Townsville":
    case "Miller":
    case "The Gap":
    case "Wright":
    case "Makin":
    case "Bunbury":
    case "Kimberley":
    case "Corangamite":
    case "Berwick":
    case "Murchison":
    case "Cessnock":
    case "Charlestown":
      return { color: "rosybrown" };
    case "Mundingburra":
    case "South Brisbane":
    case "Fisher":
    case "Spence":
    case "Mindarie":
    case "Mid-West":
    case "Corio":
    case "Box Hill":
    case "Narre Warren South":
    case "Clarence":
    case "Coffs Harbour":
      return { color: "teal" };
    case "Burdekin":
    case "Greenslopes":
    case "Central":
    case "Fairfax":
    case "Barker":
    case "Butler":
    case "Pilbara":
    case "Deakin":
    case "Brighton":
    case "Nepean":
    case "Coogee":
    case "Cootamundra":
      return { color: "darkkhaki" };
    case "Whitsunday":
    case "Bulimba":
    case "Walter Taylor":
    case "Dickson":
    case "Grey":
    case "Cannington":
    case "Roe":
    case "Dunkley":
    case "Niddrie":
    case "Prosser":
    case "Cronulla":
    case "Davidson":
      return { color: "peru" };
    case "Mackay":
    case "Lytton":
    case "Pullenvale":
    case "Longman":
    case "Mayo":
    case "Carine":
    case "Flinders":
    case "Northcote":
    case "Rosevears":
    case "Drummoyne":
    case "Dubbo":
      return { color: "steelblue" };
    case "Mirani":
    case "Chatsworth":
    case "Jamboree":
    case "Lilley":
    case "Central Wheatbelt":
    case "Fraser":
    case "Bulleen":
    case "Oakleigh":
    case "Rumney":
    case "East Hills":
    case "Epping":
      return { color: "yellowgreen" };
    case "Rockhampton":
    case "Capalaba":
    case "Brisbane":
    case "Forest Lake":
    case "Churchlands":
    case "Gellibrand":
    case "Ovens Valley":
    case "Windermere":
    case "Fairfield":
    case "Gosford":
      return { color: "indianred" };
    case "Keppel":
    case "Oodgeroo":
    case "Tennyson":
    case "Petrie":
    case "Belmont":
    case "Cockburn":
    case "Gippsland":
    case "Carrum":
    case "Bentleigh":
    case "Pakenham":
    case "Pembroke":
    case "Goulburn":
    case "Granville":
      return { color: "darkblue" };
    case "Gladstone":
    case "Redlands":
    case "Moorooka":
    case "Ryan":
    case "Collie-Preston":
    case "Goldstein":
    case "Caulfield":
    case "Pascoe Vale":
    case "Hawkesbury":
    case "Heathcote":
      return { color: "limegreen" };
    case "Callide":
    case "Morningside":
    case "Springwood":
    case "Blair":
    case "Cotesloe":
    case "Gorton":
    case "Clarinda":
    case "Point Cook":
    case "Heffron":
    case "Holsworthy":
      return { color: "goldenrod" };
    case "Burnett":
    case "Mansfield":
    case "Calamvale":
    case "Oxley":
    case "Darling Range":
    case "Hawke":
    case "Polwarth":
    case "Hornsby":
    case "Keira":
      return { color: "#7f007f" };
    case "Bundaberg":
    case "Toohey":
    case "Runcorn":
    case "Bonner":
    case "Dawesville":
    case "Holt":
    case "Prahran":
    case "Kiama":
      return { color: "darkseagreen" };
    case "Hervey Bay":
    case "Algester":
    case "The Gabba":
    case "Griffith":
    case "Forrestfield":
    case "Hotham":
    case "Dandenong":
    case "Preston":
    case "Kogarah":
    case "Lake Macquarie":
      return { color: "#b03060" };
    case "Maryborough":
    case "Stretton":
    case "Coorparoo":
    case "Moreton":
    case "Fremantle":
    case "Indi":
    case "Eildon":
    case "Richmond":
    case "Lane Cove":
    case "Leppington":
      return { color: "mediumturquoise" };
    case "Gympie":
    case "Woodridge":
    case "Doboy":
    case "Bowman":
    case "Geraldton":
    case "Isaacs":
    case "Lismore":
    case "Kellyville":
    case "Liverpool":
      return { color: "darkorchid" };
    case "Noosa":
    case "Waterford":
    case "Holland Park":
    case "Forde":
    case "Hillarys":
    case "Jagajaga":
    case "Ripon":
    case "Londonderry":
    case "Macquarie Fields":
      return { color: "red" };
    case "Nicklin":
    case "Macalister":
    case "Macgregor":
    case "Rankin":
    case "Jandakot":
    case "Kooyong":
    case "Eureka":
    case "Rowville":
    case "Maitland":
    case "Manly":
      return { color: "darkorange" };
    case "Ninderry":
    case "Logan":
    case "Chandler":
    case "Fadden":
    case "Joondalup":
    case "Lalor":
    case "Euroa":
    case "Sandringham":
    case "Maroubra":
    case "Miranda":
      return { color: "gold" };
    case "Maroochydore":
    case "Coomera":
    case "Kalamunda":
    case "La Trobe":
    case "Evelyn":
    case "Broadmeadows":
    case "Shepparton":
    case "Nelson":
    case "Monaro":
    case "Mount Druitt":
      return { color: "yellow" };
    case "Buderim":
    case "Theodore":
    case "Moncrieff":
    case "Kingsley":
    case "Macnamara":
    case "Footscray":
    case "South Barwon":
    case "Murray":
    case "Myall Lakes":
      return { color: "mediumblue" };
    case "Kawana":
    case "Wynnum-Manly":
    case "Broadwater":
    case "Kwinana":
    case "Mallee":
    case "Frankston":
    case "Croydon":
    case "Greenvale":
    case "South-West Coast":
    case "Newcastle":
      return { color: "lime" };
    case "Caloundra":
    case "Bonney":
    case "Landsdale":
    case "Maribyrnong":
    case "Geelong":
    case "St Albans":
    case "Newtown":
    case "North Shore":
      return { color: "springgreen" };
    case "Glass House":
    case "Gaven":
    case "Mandurah":
    case "McEwen":
    case "Gippsland East":
    case "Northern Tablelands":
    case "Oatley":
      return { color: "darksalmon" };
    case "Pumicestone":
    case "Southport":
    case "Maylands":
    case "Eltham":
    case "Melbourne":
    case "Gippsland South":
    case "Sydenham":
    case "Orange":
      return { color: "crimson" };
    case "Morayfield":
    case "Surfers Paradise":
    case "Midland":
    case "Menzies":
    case "Bundoora":
    case "Glen Waverley":
    case "Cranbourne":
    case "Sunbury":
    case "Tarneit":
    case "Parramatta":
    case "Penrith":
      return { color: "deepskyblue" };
    case "Kurwongbah":
    case "Mermaid Beach":
    case "Girrawheen":
    case "Monash":
    case "Thomastown":
    case "Pittwater":
    case "Port Macquarie":
      return { color: "blue" };
    case "Bancroft":
    case "Burleigh":
    case "Morley":
    case "Nicholls":
    case "Hastings":
    case "Warrandyte":
    case "Port Stephens":
    case "Prospect":
      return { color: "#a020f0" };
    case "Murrumba":
    case "Currumbin":
    case "Mount Lawley":
    case "Scullin":
    case "Brunswick":
    case "Hawthorn":
    case "Wendouree":
    case "Riverstone":
    case "Rockdale":
    case "Terrigal":
      return { color: "greenyellow" };
    case "Redcliffe":
    case "Mudgeeraba":
    case "Murray-Wellington":
    case "Wannon":
    case "Ivanhoe":
    case "Werribee":
    case "Ryde":
    case "Shellharbour":
      return { color: "orchid" };
    case "Sandgate":
    case "Scenic Rim":
    case "McPherson":
    case "Nedlands":
    case "Wills":
    case "Kalkallo":
    case "Ringwood":
    case "Williamstown":
    case "South Coast":
    case "Strathfield":
      return { color: "coral" };
    case "Nudgee":
    case "Lockyer":
    case "Oakford":
    case "Kew":
    case "Narre Warren North":
    case "Essendon":
    case "Yan Yean":
    case "Summer Hill":
    case "Swansea":
      return { color: "fuchsia" };
    case "Clayfield":
    case "Nanango":
    case "Perth":
    case "Kororoit":
    case "Sydney":
    case "Tamworth":
    case "The Entrance":
      return { color: "dodgerblue" };
    case "McConnel":
    case "Condamine":
    case "Riverton":
    case "Lara":
      return { color: "palevioletred" };
    case "Stafford":
    case "Toowoomba North":
    case "Rockingham":
    case "Laverton":
    case "Tweed":
    case "Upper Hunter":
      return { color: "plum" };
    case "Aspley":
    case "Toowoomba South":
    case "Scarborough":
    case "Lowan":
    case "Vaucluse":
    case "Wagga Wagga":
      return { color: "skyblue" };
    case "Pine Rivers":
    case "Southern Downs":
    case "South Perth":
    case "Macedon":
    case "Wahroonga":
    case "Wakehurst":
      return { color: "deeppink" };
    case "Everton":
    case "Southern River":
    case "Malvern":
    case "Wallsend":
    case "Willoughby":
      return { color: "mediumslateblue" };
    case "(new 1)":
      return { color: "wheat" };
    case "(new 2)":
      return { color: "palegreen" };
    case "(new 3)":
      return { color: "aquamarine" };
    case "(new 4)":
      return { color: "hotpink" };
    case "(new 5)":
      return { color: "pink" };
    default:
      return { color: "black" };
  }
}
