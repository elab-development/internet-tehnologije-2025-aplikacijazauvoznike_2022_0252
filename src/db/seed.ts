import "dotenv/config";
import { db } from "./index";
import { users } from "./schema/users";
import { productCategories } from "./schema/productCategories";
import { productOffers } from "./schema/productOffers";
import bcrypt from "bcryptjs";

async function seed() {


  const [admin] = await db.insert(users).values({
    email: "admin@example.com",
    passHash: await bcrypt.hash("admin123", 10),
    role: "ADMIN",
    companyName: null,
    country: null,
    address: null,
  }).returning();

  const [importer] = await db.insert(users).values({
    email: "importer1@example.com",
    passHash: await bcrypt.hash("importer123", 10),
    role: "IMPORTER",
    companyName: "Importer DOO",
    country: "Serbia",
    address: "Bulevar Kralja Aleksandra 1, Beograd",
  }).returning();

  const [supplier1] = await db.insert(users).values({
    email: "supplier1@example.com",
    passHash: await bcrypt.hash("supplier123", 10),
    role: "SUPPLIER",
    companyName: "Adriatic Tech DOO",
    country: "Croatia",
    address: "Ilica 15, Zagreb",
  }).returning();

  const [supplier2] = await db.insert(users).values({
    email: "supplier2@example.com",
    passHash: await bcrypt.hash("supplier123", 10),
    role: "SUPPLIER",
    companyName: "Balkan Electronics Ltd",
    country: "Bulgaria",
    address: "Vitosha Blvd 20, Sofia",
  }).returning();

  const [supplier3] = await db.insert(users).values({
    email: "supplier3@example.com",
    passHash: await bcrypt.hash("supplier123", 10),
    role: "SUPPLIER",
    companyName: "Global Devices Ltd",
    country: "Hungary",
    address: "Váci út 12, Budapest",
  }).returning();


  const [phones] = await db.insert(productCategories).values({ name: "Phones" }).returning();
  const [laptops] = await db.insert(productCategories).values({ name: "Laptops" }).returning();
  const [tablets] = await db.insert(productCategories).values({ name: "Tablets" }).returning();
  const [accessories] = await db.insert(productCategories).values({ name: "Accessories" }).returning();
  const [televisions] = await db.insert(productCategories).values({ name: "Televisions" }).returning();


  await db.insert(productOffers).values([


    {
      supplierId: supplier2.id,
      categoryId: phones.id,
      code: "IP15-128",
      name: "iPhone 15",
      description: "Apple iPhone 15, 128GB",
      imageUrl: "https://img.ep-cdn.com/i/500/500/te/tebqzdyrivfnoaswpclh/apple-iphone-15-128gb-blue-mtp43sx-a-mobilni-telefon-cene.jpg",
      price: "800.00",
      width: 7.1,
      height: 14.7,
      depth: 0.8,
    },
    {
      supplierId: supplier2.id,
      categoryId: phones.id,
      code: "SGS24-256",
      name: "Samsung Galaxy S24",
      description: "Samsung Galaxy S24, 256GB",
      imageUrl: "https://img.ep-cdn.com/i/500/500/sr/srpgyfotjichuevxdazm/samsung-galaxy-s24-5g-sm-s921bzygeuc-8gb-256gb-amber-yellow-mobilni-telefon-cene.jpg",
      price: "750.00",
      width: 7.0,
      height: 14.6,
      depth: 0.8,
    },
    {
      supplierId: supplier2.id,
      categoryId: laptops.id,
      code: "MBA-M2-13",
      name: "MacBook Air M2",
      description: "Apple MacBook Air M2, 13-inch",
      imageUrl: "https://istyle.rs/cdn/shop/files/IMG-5560689_m_jpg_0.jpg?v=1759441900&width=823",
      price: "1200.00",
      width: 30.4,
      height: 21.5,
      depth: 1.1,
    },
    {
      supplierId: supplier2.id,
      categoryId: laptops.id,
      code: "XPS13-I7",
      name: "Dell XPS 13",
      description: "Dell XPS 13, Intel i7",
      imageUrl: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/dell-plus/db16255/media-gallery/non-touch/laptop-dell-plus-db16255nt-ice-bl-fpr-gallery-5.psd?fmt=png-alpha",
      price: "1100.00",
      width: 29.6,
      height: 19.9,
      depth: 1.5,
    },
    {
      supplierId: supplier2.id,
      categoryId: tablets.id,
      code: "IPAD-PRO-11",
      name: "iPad Pro 11\"",
      description: "Apple iPad Pro 11-inch",
      imageUrl: "https://superfon.rs/wp-content/uploads/2024/03/iPad-10.9-10th-Gen-Wi-Fi-64GB-Plavi.png.webp",
      price: "900.00",
      width: 24.7,
      height: 17.8,
      depth: 0.6,
    },
    {
      supplierId: supplier2.id,
      categoryId: tablets.id,
      code: "TAB-S9",
      name: "Samsung Galaxy Tab S9",
      description: "Samsung Galaxy Tab S9, 128GB",
      imageUrl: "https://images.prismic.io/esis/961a5105-ccf0-4eca-be91-3d7f30e47a3d_image+%283%29.png",
      price: "650.00",
      width: 25.4,
      height: 16.6,
      depth: 0.6,
    },
    {
      supplierId: supplier2.id,
      categoryId: accessories.id,
      code: "CHARGER-65W",
      name: "USB-C Charger 65W",
      description: "Fast USB-C charger 65W",
      imageUrl: "https://www.computerland.rs/login/media/images/products/mi-65w-fast-charger-with-gan.jpg",
      price: "45.00",
      width: 6,
      height: 6,
      depth: 3,
    },
    {
      supplierId: supplier2.id,
      categoryId: accessories.id,
      code: "MOUSE-WLS",
      name: "Wireless Mouse",
      description: "Wireless mouse (USB receiver / Bluetooth)",
      imageUrl: "https://www.mytrendyphone.rs/images/2-4G-Wireless-Optical-Mouse-Rechargeable-Aluminium-Alloy-Mice-with-Type-C-Adapter-for-Desktop-Computer-Office-Laptop-BlackNone-03012024-00-p.webp",
      price: "25.00",
      width: 6.5,
      height: 11.0,
      depth: 3.8,
    },


    {
      supplierId: supplier1.id,
      categoryId: televisions.id,
      code: "LG-OLED55",
      name: "LG OLED 55\"",
      description: "LG 55-inch OLED 4K Smart TV",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdJ8_24EPBoDxayBdr77PUUnhm8md9ckiMRw&s",
      price: "1300.00",
      width: 122,
      height: 71,
      depth: 5,
    },
    {
      supplierId: supplier1.id,
      categoryId: televisions.id,
      code: "PHILIPS-50",
      name: "Philips 50\" 4K",
      description: "Philips 50-inch 4K Smart TV",
      imageUrl: "https://images.philips.com/is/image/philipsconsumer/b9f0a4e90cb4402cb658b0f5003a848e?wid=700&hei=700&$pnglarge$",
      price: "720.00",
      width: 112,
      height: 65,
      depth: 6,
    },
    {
      supplierId: supplier1.id,
      categoryId: phones.id,
      code: "PIXEL-8",
      name: "Google Pixel 8",
      description: "Google Pixel 8 128GB",
      imageUrl: "https://m.media-amazon.com/images/I/71SfoZu9a3L._AC_SL400_.jpg",
      price: "690.00",
      width: 7.2,
      height: 15,
      depth: 0.8,
    },
    {
      supplierId: supplier1.id,
      categoryId: laptops.id,
      code: "ACER-SWIFT",
      name: "Acer Swift 3",
      description: "Acer Swift 3 Ryzen 7",
      imageUrl: "https://www.winwin.rs/media/catalog/product/cache/aa01455892d233ac3aea63acd876143d/a/c/acer-swift-3-sf314-43-r2b3-nx-ab1ex-017_1.webp",
      price: "880.00",
      width: 32,
      height: 22,
      depth: 1.7,
    },
    {
      supplierId: supplier1.id,
      categoryId: accessories.id,
      code: "SOUND-BAR",
      name: "Soundbar 2.1",
      description: "2.1 Channel Soundbar System",
      imageUrl: "https://m.media-amazon.com/images/I/612GoGAkRYL._AC_UF894,1000_QL80_.jpg",
      price: "210.00",
      width: 90,
      height: 8,
      depth: 10,
    },


    {
      supplierId: supplier3.id,
      categoryId: televisions.id,
      code: "SONY-75",
      name: "Sony 75\" 4K",
      description: "Sony 75-inch 4K Smart TV",
      imageUrl: "https://img.ep-cdn.com/i/500/500/as/asqnlzewdibcxfrhmvyk/sony-televizor-kd75x75wlpaep-cene.jpg",
      price: "1800.00",
      width: 167,
      height: 96,
      depth: 6,
    },
    {
      supplierId: supplier3.id,
      categoryId: televisions.id,
      code: "TCL-65",
      name: "TCL 65\" 4K",
      description: "TCL 65-inch 4K UHD Smart TV",
      imageUrl: "https://img.ep-cdn.com/i/500/500/vb/vbzsxvdjlcsywlirkhit/tcl-televizor-65v6b-led-65-4k-hdr-60hz-google-tv-crna-cene.jpg",
      price: "950.00",
      width: 145,
      height: 83,
      depth: 6,
    },
    {
      supplierId: supplier3.id,
      categoryId: tablets.id,
      code: "HUAWEI-MATEPAD",
      name: "Huawei MatePad 11",
      description: "Huawei MatePad 11-inch",
      imageUrl: "https://i0.wp.com/pcpress.rs/wp-content/uploads/2021/08/Huawei-MatePad-11.jpg?ssl=1",
      price: "420.00",
      width: 25,
      height: 17,
      depth: 0.7,
    },
    {
      supplierId: supplier3.id,
      categoryId: phones.id,
      code: "ONEPLUS-12",
      name: "OnePlus 12",
      description: "OnePlus 12 256GB",
      imageUrl: "https://oasis.opstatics.com/content/dam/oasis/page/2023/cn/12/12-green.png",
      price: "730.00",
      width: 7.4,
      height: 16,
      depth: 0.8,
    },
    {
      supplierId: supplier3.id,
      categoryId: accessories.id,
      code: "GAMING-MOUSE",
      name: "Gaming Mouse Pro",
      description: "High precision gaming mouse",
      imageUrl: "https://img.ep-cdn.com/i/500/500/no/nohuvbgfcxaewzdjryql/lorgar-msp80-8000-hz-gaming-mouse-pro-black-cene.jpg",
      price: "60.00",
      width: 7,
      height: 12,
      depth: 4,
    },

  ]);

  console.log("Seed done.");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});