// Division color mapping for Australian redistribution tool

function getColor(division) { // same mapping as original
  switch (division) {
    case "SPLIT":
      return { color: "white" };
    case "Warrego":
    case "Ferny Grove":
    case "Capricornia":
      return { color: "silver" };
    case "Gregory":
    case "Cooper":
    case "Herbert":
    case "Swan Hills":
      return { color: "darkslategray" };
    case "Traeger":
    case "Maiwar":
    case "Paddington":
    case "Kennedy":
    case "Albany":
    case "Thornlie":
      return { color: "darkolivegreen" };
    case "Cook":
    case "Moggill":
    case "Leichhardt":
    case "Bracken Ridge":
    case "Bass":
    case "Armadale":
    case "Vasse":
      return { color: "sienna" };
    case "Barron River":
    case "Ipswich West":
    case "Dawson":
    case "Deagon":
    case "Braddon":
    case "Balcata":
    case "Victoria Park":
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
      return { color: "olive" };
    case "Hinchinbrook":
    case "Inala":
    case "Marchant":
    case "Groom":
    case "Boothby":
    case "West Swan":
      return { color: "lightslategray" };
    case "Thuringowa":
    case "Mount Ommaney":
    case "Enoggera":
    case "Maranoa":
    case "Kingston":
    case "Bicton":
    case "Bibra Lake":
    case "Kalgoorlie":
      return { color: "green" };
    case "Townsville":
    case "Miller":
    case "The Gap":
    case "Wright":
    case "Makin":
    case "Bunbury":
    case "Kimberley":
      return { color: "rosybrown" };
    case "Mundingburra":
    case "South Brisbane":
    case "Fisher":
    case "Spence":
    case "Mindarie":
    case "Mid-West":
      return { color: "teal" };
    case "Burdekin":
    case "Greenslopes":
    case "Central":
    case "Fairfax":
    case "Barker":
    case "Butler":
    case "Pilbara":
      return { color: "darkkhaki" };
    case "Whitsunday":
    case "Bulimba":
    case "Walter Taylor":
    case "Dickson":
    case "Grey":
    case "Cannington":
    case "Roe":
      return { color: "peru" };
    case "Mackay":
    case "Lytton":
    case "Pullenvale":
    case "Longman":
    case "Mayo":
    case "Carine":
      return { color: "steelblue" };
    case "Mirani":
    case "Chatsworth":
    case "Jamboree":
    case "Lilley":
    case "Central Wheatbelt":
      return { color: "yellowgreen" };
    case "Rockhampton":
    case "Capalaba":
    case "Brisbane":
    case "Forest Lake":
    case "Churchlands":
      return { color: "indianred" };
    case "Keppel":
    case "Oodgeroo":
    case "Tennyson":
    case "Petrie":
    case "Belmont":
    case "Cockburn":
      return { color: "darkblue" };
    case "Gladstone":
    case "Redlands":
    case "Moorooka":
    case "Ryan":
    case "Collie-Preston":
      return { color: "limegreen" };
    case "Callide":
    case "Morningside":
    case "Springwood":
    case "Blair":
    case "Cotesloe":
      return { color: "goldenrod" };
    case "Burnett":
    case "Mansfield":
    case "Calamvale":
    case "Oxley":
    case "Darling Range":
      return { color: "#7f007f" };
    case "Bundaberg":
    case "Toohey":
    case "Runcorn":
    case "Bonner":
    case "Dawesville":
      return { color: "darkseagreen" };
    case "Hervey Bay":
    case "Algester":
    case "The Gabba":
    case "Griffith":
    case "Forrestfield":
      return { color: "#b03060" };
    case "Maryborough":
    case "Stretton":
    case "Coorparoo":
    case "Moreton":
    case "Fremantle":
      return { color: "mediumturquoise" };
    case "Gympie":
    case "Woodridge":
    case "Doboy":
    case "Bowman":
    case "Geraldton":
      return { color: "darkorchid" };
    case "Noosa":
    case "Waterford":
    case "Holland Park":
    case "Forde":
    case "Hillarys":
      return { color: "red" };
    case "Nicklin":
    case "Macalister":
    case "Macgregor":
    case "Rankin":
    case "Jandakot":
      return { color: "darkorange" };
    case "Ninderry":
    case "Logan":
    case "Chandler":
    case "Fadden":
    case "Joondalup":
      return { color: "gold" };
    case "Maroochydore":
    case "Coomera":
    case "Kalamunda":
      return { color: "yellow" };
    case "Buderim":
    case "Theodore":
    case "Moncrieff":
    case "Kingsley":
      return { color: "mediumblue" };
    case "Kawana":
    case "Wynnum-Manly":
    case "Broadwater":
    case "Kwinana":
      return { color: "lime" };
    case "Caloundra":
    case "Bonney":
    case "Landsdale":
      return { color: "springgreen" };
    case "Glass House":
    case "Gaven":
    case "Mandurah":
      return { color: "darksalmon" };
    case "Pumicestone":
    case "Southport":
    case "Maylands":
      return { color: "crimson" };
    case "Morayfield":
    case "Surfers Paradise":
    case "Midland":
      return { color: "deepskyblue" };
    case "Kurwongbah":
    case "Mermaid Beach":
    case "Girrawheen":
      return { color: "blue" };
    case "Bancroft":
    case "Burleigh":
    case "Morley":
      return { color: "#a020f0" };
    case "Murrumba":
    case "Currumbin":
    case "Mount Lawley":
      return { color: "greenyellow" };
    case "Redcliffe":
    case "Mudgeeraba":
    case "Murray-Wellington":
      return { color: "orchid" };
    case "Sandgate":
    case "Scenic Rim":
    case "McPherson":
    case "Nedlands":
      return { color: "coral" };
    case "Nudgee":
    case "Lockyer":
    case "Oakford":
      return { color: "fuchsia" };
    case "Clayfield":
    case "Nanango":
    case "Perth":
      return { color: "dodgerblue" };
    case "McConnel":
    case "Condamine":
    case "Riverton":
      return { color: "palevioletred" };
    case "Stafford":
    case "Toowoomba North":
    case "Rockingham":
      return { color: "plum" };
    case "Aspley":
    case "Toowoomba South":
    case "Scarborough":
      return { color: "skyblue" };
    case "Pine Rivers":
    case "Southern Downs":
    case "South Perth":
      return { color: "deeppink" };
    case "Everton":
    case "Southern River":
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

// Export for module systems (if used) or make available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getColor };
} else {
  window.getColor = getColor;
}
