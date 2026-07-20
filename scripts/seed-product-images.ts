/** Curated Pexels images + product names per subcategory for seed data */

function px(id: number, w = 1200) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
}

export const SUBCATEGORY_PRODUCT_NAMES: Record<string, string[]> = {
  "Men's Clothing": [
    "Classic Cotton Shirt",
    "Slim Fit Polo Tee",
    "Denim Casual Jacket",
    "Linen Summer Shirt",
  ],
  "Women's Clothing": [
    "Floral Midi Dress",
    "Casual Blouse Top",
    "High-Waist Trousers",
    "Knit Sweater",
  ],
  "Ethnic Wear": [
    "Embroidered Kurta Set",
    "Silk Saree",
    "Anarkali Suit",
    "Men's Sherwani",
  ],
  "Kids' Clothing": [
    "Kids Cotton T-Shirt",
    "Boys Denim Jeans",
    "Girls Frock Dress",
    "Kids Hoodie",
  ],
  Sleepwear: ["Cotton Pajama Set", "Silk Night Gown", "Loungewear Set", "Thermal Sleepwear"],
  Innerwear: ["Cotton Vest Pack", "Sports Briefs", "Seamless Bra", "Trunks Combo"],
  Backpacks: ["Travel Backpack", "College Daypack", "Hiking Rucksack", "Anti-Theft Backpack"],
  Handbags: ["Leather Tote Bag", "Crossbody Handbag", "Satchel Purse", "Chain Shoulder Bag"],
  Wallets: ["Bi-Fold Leather Wallet", "RFID Card Holder", "Slim Money Clip", "Zip Coin Purse"],
  "Laptop Bags": [
    "Padded Laptop Sleeve",
    "Business Laptop Bag",
    "Messenger Laptop Case",
    "Rolling Laptop Trolley",
  ],
  "Trolley Bags": [
    "Hard Shell Suitcase",
    "Cabin Spinner Trolley",
    "Expandable Luggage Set",
    "Travel Trolley Bag",
  ],
  "Smart Watches": [
    "Fitness Smart Watch",
    "Bluetooth Calling Watch",
    "AMOLED Smartwatch",
    "Sports GPS Watch",
  ],
  "Analog Watches": [
    "Stainless Steel Watch",
    "Leather Strap Watch",
    "Chronograph Dial Watch",
    "Minimalist Analog Watch",
  ],
  "Luxury Watches": [
    "Gold Dial Watch",
    "Automatic Luxury Watch",
    "Diamond Bezel Watch",
    "Premium Dress Watch",
  ],
  Earrings: ["Stud Earrings", "Hoop Earrings", "Drop Earrings", "Pearl Earrings"],
  Rings: ["Solitaire Ring", "Gold Band Ring", "Gemstone Ring", "Couple Ring Set"],
  Necklaces: ["Pendant Necklace", "Layered Chain", "Pearl Necklace", "Choker Necklace"],
  Bracelets: ["Charm Bracelet", "Tennis Bracelet", "Leather Wristband", "Beaded Bracelet"],
  Sunglasses: ["Aviator Sunglasses", "Wayfarer Shades", "Polarized Sunglasses", "Round Frame Glasses"],
  "Men's Shoes": ["Leather Oxford Shoes", "Casual Loafers", "Formal Derby Shoes", "Slip-On Moccasins"],
  "Women's Shoes": ["Block Heel Pumps", "Ballet Flats", "Ankle Strap Heels", "Peep Toe Sandals"],
  "Kids' Shoes": ["Kids School Shoes", "Velcro Sneakers", "Kids Sandals", "Light-Up Shoes"],
  Sneakers: ["Running Sneakers", "Canvas Sneakers", "High-Top Sneakers", "White Lifestyle Sneakers"],
  "Sports Shoes": [
    "Training Shoes",
    "Badminton Court Shoes",
    "Football Cleats",
    "Trekking Sports Shoes",
  ],
  "Wireless Earbuds": [
    "TWS Earbuds Pro",
    "Noise Cancelling Earbuds",
    "Gaming Earbuds",
    "Sports Wireless Earbuds",
  ],
  Headphones: ["Over-Ear Headphones", "Studio Monitor Headphones", "Foldable Headphones", "Bass Headphones"],
  "Bluetooth Speakers": [
    "Portable Bluetooth Speaker",
    "Waterproof Party Speaker",
    "Mini Pocket Speaker",
    "360° Sound Speaker",
  ],
  Microphones: ["USB Condenser Mic", "Podcast Microphone", "Lavalier Mic", "Wireless Mic Kit"],
  Books: ["Bestseller Novel", "Self-Help Book", "Children Story Book", "Cookbook Edition"],
  Notebooks: ["Ruled Notebook", "Spiral Journal", "Hardcover Diary", "Bullet Journal"],
  Pens: ["Ballpoint Pen Set", "Gel Pen Pack", "Fountain Pen", "Marker Pen Combo"],
  "Art & Craft": ["Acrylic Paint Set", "Sketch Pencil Kit", "Craft Paper Pack", "DIY Craft Kit"],
  Plants: ["Indoor Money Plant", "Succulent Pot", "Snake Plant", "Bonsai Plant"],
  "Outdoor Furniture": [
    "Patio Chair Set",
    "Garden Bench",
    "Outdoor Dining Table",
    "Wicker Lounge Chair",
  ],
  "BBQ Accessories": ["BBQ Grill Tool Set", "Charcoal Starter Kit", "Grill Cover", "Skewer & Tongs Set"],
  Snacks: ["Potato Chips Pack", "Mixed Namkeen", "Protein Snack Bar", "Trail Mix Pack"],
  "Rice & Grains": ["Basmati Rice 5kg", "Brown Rice Pack", "Quinoa Grains", "Multigrain Atta"],
  "Organic Foods": ["Organic Honey Jar", "Cold Pressed Oil", "Organic Turmeric", "Organic Green Tea"],
};

/** 8+ images per subcategory — all relevant to that product type */
export const SUBCATEGORY_IMAGES: Record<string, string[]> = {
  "Men's Clothing": [
    px(1183266),
    px(937481),
    px(1926769),
    px(2983464),
    px(7671166),
    px(6311477),
    px(1926769, 900),
    px(1183266, 900),
  ],
  "Women's Clothing": [
    px(1536619),
    px(985635),
    px(606242),
    px(1926769),
    px(1536619, 900),
    px(985635, 900),
    px(606242, 900),
    px(7671166, 900),
  ],
  "Ethnic Wear": [
    px(2679500),
    px(1884580),
    px(985635),
    px(2679500, 900),
    px(1884580, 900),
    px(1536619, 900),
    px(2679500, 800),
    px(1884580, 800),
  ],
  "Kids' Clothing": [
    px(3608263),
    px(8613089),
    px(3608263, 900),
    px(8613089, 900),
    px(35518866),
    px(3608263, 800),
    px(8613089, 800),
    px(35518866, 900),
  ],
  Sleepwear: [px(6311651), px(6311392), px(6311651, 900), px(6311392, 900), px(6311651, 800), px(6311392, 800)],
  Innerwear: [px(6311651), px(6311392), px(6311477), px(6311651, 900), px(6311392, 900), px(6311477, 900)],
  Backpacks: [px(1552617), px(2906958), px(3731256), px(1552617, 900), px(2906958, 900), px(3731256, 900), px(1552617, 800), px(2906958, 800)],
  Handbags: [px(1152077), px(2906958), px(1152077, 900), px(2906958, 900), px(3731256, 900), px(1152077, 800), px(2906958, 800), px(3731256, 800)],
  Wallets: [px(7937297), px(6980213), px(7937297, 900), px(6980213, 900), px(7937297, 800), px(6980213, 800), px(2906958, 900), px(1552617, 900)],
  "Laptop Bags": [px(3731256), px(1552617), px(2906958), px(3731256, 900), px(1552617, 900), px(2906958, 900), px(3731256, 800), px(1552617, 800)],
  "Trolley Bags": [px(4489720), px(4487575), px(4489720, 900), px(4487575, 900), px(4489720, 800), px(4487575, 800), px(3731256, 900), px(1552617, 900)],
  "Smart Watches": [px(4370373), px(3930477), px(4370373, 900), px(3930477, 900), px(4370373, 800), px(3930477, 800), px(190819, 900), px(2783873, 900)],
  "Analog Watches": [px(190819), px(2783873), px(997330), px(190819, 900), px(2783873, 900), px(997330, 900), px(190819, 800), px(2783873, 800)],
  "Luxury Watches": [px(997330), px(190819), px(125779), px(997330, 900), px(190819, 900), px(125779, 900), px(2783873, 900), px(997330, 800)],
  Earrings: [px(3266703), px(1191531), px(3266703, 900), px(1191531, 900), px(10361481), px(3266703, 800), px(1191531, 800), px(18451698, 900)],
  Rings: [px(3266703), px(10361481), px(18451698), px(265791), px(3266703, 900), px(10361481, 900), px(18451698, 900), px(265791, 900)],
  Necklaces: [px(1191531), px(3266703), px(10361481), px(1191531, 900), px(3266703, 900), px(10361481, 900), px(18451698, 900), px(1191531, 800)],
  Bracelets: [px(1191531), px(10361481), px(18451698), px(1191531, 900), px(10361481, 900), px(3266703, 900), px(265791, 900), px(1191531, 800)],
  Sunglasses: [px(157675), px(46710), px(701877), px(157675, 900), px(46710, 900), px(701877, 900), px(157675, 800), px(46710, 800)],
  "Men's Shoes": [px(2529148), px(1598505), px(190406), px(2529148, 900), px(1598505, 900), px(190406, 900), px(1464625, 900), px(2529148, 800)],
  "Women's Shoes": [px(3363728), px(134064), px(3363716), px(3363728, 900), px(134064, 900), px(3363716, 900), px(3363728, 800), px(134064, 800)],
  "Kids' Shoes": [px(3608263), px(190406), px(2529148), px(3608263, 900), px(190406, 900), px(2529148, 900), px(1598505, 900), px(3608263, 800)],
  Sneakers: [px(2529148), px(1598505), px(1464625), px(2529148, 900), px(1598505, 900), px(1464625, 900), px(190406, 900), px(2529148, 800)],
  "Sports Shoes": [px(1464625), px(2529148), px(190406), px(1464625, 900), px(2529148, 900), px(190406, 900), px(1598505, 900), px(1464625, 800)],
  "Wireless Earbuds": [px(3825517), px(3944405), px(3825517, 900), px(3944405, 900), px(3394650, 900), px(3825517, 800), px(3944405, 800), px(3394650, 800)],
  Headphones: [px(3825517), px(3394650), px(3944405), px(3825517, 900), px(3394650, 900), px(3944405, 900), px(3825517, 800), px(3394650, 800)],
  "Bluetooth Speakers": [px(3764649), px(848616), px(3764649, 900), px(848616, 900), px(3764649, 800), px(848616, 800), px(3944405, 900), px(3394650, 900)],
  Microphones: [px(164745), px(7138780), px(164745, 900), px(7138780, 900), px(164745, 800), px(7138780, 800), px(3825517, 900), px(3944405, 900)],
  Books: [px(159711), px(159866), px(159751), px(159711, 900), px(159866, 900), px(159751, 900), px(159711, 800), px(159866, 800)],
  Notebooks: [px(159751), px(159866), px(159711), px(159751, 900), px(159866, 900), px(4486361, 900), px(159751, 800), px(159866, 800)],
  Pens: [px(4486361), px(159751), px(159866), px(4486361, 900), px(159751, 900), px(159866, 900), px(4486361, 800), px(159751, 800)],
  "Art & Craft": [px(6230729), px(6230729, 900), px(4486361, 900), px(159751, 900), px(6230729, 800), px(159866, 900), px(159711, 900), px(4486361, 800)],
  Plants: [px(1072824), px(1084199), px(1072824, 900), px(1084199, 900), px(1072824, 800), px(1084199, 800), px(1431339, 900), px(1435907, 900)],
  "Outdoor Furniture": [px(1571460), px(1571463), px(1571460, 900), px(1571463, 900), px(1571460, 800), px(1571463, 800), px(1571460, 700), px(1571463, 700)],
  "BBQ Accessories": [px(1527603), px(1527603, 900), px(1527603, 800), px(1571460, 900), px(1571463, 900), px(1527603, 700), px(1571460, 800), px(1571463, 800)],
  Snacks: [px(4198370), px(1640777), px(4198370, 900), px(1640777, 900), px(4198370, 800), px(1640777, 800), px(1431339, 900), px(33239, 900)],
  "Rice & Grains": [px(33239), px(1458696), px(33239, 900), px(1458696, 900), px(33239, 800), px(1458696, 800), px(1431339, 900), px(1435907, 900)],
  "Organic Foods": [px(1431339), px(1435907), px(1431339, 900), px(1435907, 900), px(1431339, 800), px(1435907, 800), px(33239, 900), px(1458696, 900)],
};

/** Color-specific variant images for categories that use color swatches */
export const COLOR_VARIANT_IMAGES: Record<string, Record<string, string[]>> = {
  fashion: {
    Black: [px(1183266, 800), px(937481, 800), px(1926769, 800)],
    White: [px(2983464, 800), px(7671166, 800), px(6311477, 800)],
    Navy: [px(1926769, 800), px(1183266, 800), px(937481, 800)],
    Beige: [px(985635, 800), px(606242, 800), px(1536619, 800)],
    Olive: [px(6311477, 800), px(7671166, 800), px(2983464, 800)],
    Maroon: [px(2679500, 800), px(1884580, 800), px(985635, 800)],
  },
  footwear: {
    Black: [px(2529148, 800), px(1598505, 800), px(190406, 800)],
    White: [px(1464625, 800), px(2529148, 800), px(3363728, 800)],
    Navy: [px(190406, 800), px(2529148, 800), px(1598505, 800)],
    Beige: [px(3363716, 800), px(134064, 800), px(3363728, 800)],
    Olive: [px(1464625, 800), px(190406, 800), px(1598505, 800)],
    Maroon: [px(2529148, 800), px(3363728, 800), px(134064, 800)],
  },
  tech: {
    Black: [px(4370373, 800), px(3825517, 800), px(3930477, 800)],
    White: [px(3944405, 800), px(3394650, 800), px(3825517, 800)],
    Navy: [px(3825517, 800), px(4370373, 800), px(3930477, 800)],
    Beige: [px(3394650, 800), px(3944405, 800), px(3764649, 800)],
    Olive: [px(3930477, 800), px(4370373, 800), px(3825517, 800)],
    Maroon: [px(3944405, 800), px(3825517, 800), px(3394650, 800)],
  },
  jewelry: {
    Black: [px(3266703, 800), px(10361481, 800), px(18451698, 800)],
    White: [px(1191531, 800), px(265791, 800), px(3266703, 800)],
    Navy: [px(10361481, 800), px(3266703, 800), px(18451698, 800)],
    Beige: [px(265791, 800), px(1191531, 800), px(10361481, 800)],
    Olive: [px(18451698, 800), px(3266703, 800), px(1191531, 800)],
    Maroon: [px(10361481, 800), px(265791, 800), px(18451698, 800)],
  },
};

export function getProductBaseName(subName: string, subIndex: number): string {
  const names = SUBCATEGORY_PRODUCT_NAMES[subName];
  if (names?.length) return names[subIndex % names.length]!;
  return `${subName} Product`;
}

export function getSubcategoryImages(subName: string, categoryName: string, subIndex: number, count = 4): string[] {
  const pool =
    SUBCATEGORY_IMAGES[subName] ??
    SUBCATEGORY_IMAGES[categoryName] ??
    SUBCATEGORY_IMAGES["Men's Clothing"]!;
  const start = (subIndex * count) % pool.length;
  const images: string[] = [];
  for (let i = 0; i < count; i++) {
    const img = pool[(start + i) % pool.length]!;
    if (!images.includes(img)) images.push(img);
  }
  while (images.length < count) {
    const extra = pool[(start + images.length) % pool.length]!;
    if (!images.includes(extra)) images.push(extra);
    else break;
  }
  return images;
}

export function getColorVariantImage(
  subName: string,
  categoryName: string,
  color: string,
  subIndex: number
): string {
  const catLower = categoryName.toLowerCase();
  const subLower = subName.toLowerCase();

  let group: Record<string, string[]> | undefined;
  if (catLower.includes("footwear") || subLower.includes("shoe") || subLower.includes("sneaker")) {
    group = COLOR_VARIANT_IMAGES.footwear;
  } else if (
    catLower.includes("audio") ||
    catLower.includes("watch") ||
    subLower.includes("watch") ||
    subLower.includes("earbud") ||
    subLower.includes("headphone") ||
    subLower.includes("speaker") ||
    subLower.includes("microphone")
  ) {
    group = COLOR_VARIANT_IMAGES.tech;
  } else if (catLower.includes("jewelry") || subLower.includes("ring") || subLower.includes("earring")) {
    group = COLOR_VARIANT_IMAGES.jewelry;
  } else if (catLower.includes("fashion") || subLower.includes("clothing") || subLower.includes("wear")) {
    group = COLOR_VARIANT_IMAGES.fashion;
  }

  const colorPool = group?.[color];
  if (colorPool?.length) return colorPool[subIndex % colorPool.length]!;

  const fallback = getSubcategoryImages(subName, categoryName, subIndex, 8);
  return fallback[subIndex % fallback.length]!;
}
