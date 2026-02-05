import "dotenv/config";
import { db } from "./index";
import { users } from "./schema/users";
import { productCategories } from "./schema/productCategories";
import { productOffers } from "./schema/productOffers";
import bcrypt from "bcryptjs";

async function seed() {

  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@example.com",
      passHash: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      companyName: null,
      country: null,
      address: null,
    })
    .returning();

 
  const [importer] = await db
    .insert(users)
    .values({
      email: "importer1@example.com",
      passHash: await bcrypt.hash("importer123", 10),
      role: "IMPORTER",
      companyName: "Importer DOO",
      country: "Serbia",
      address: "Bulevar Kralja Aleksandra 1, Beograd",
    })
    .returning();


  const [supplier] = await db
    .insert(users)
    .values({
      email: "supplier1@example.com",
      passHash: await bcrypt.hash("supplier123", 10),
      role: "SUPPLIER",
      companyName: "Supplier DOO",
      country: "Serbia",
      address: "Knez Mihailova 10, Beograd",
    })
    .returning();


  const [phones] = await db
    .insert(productCategories)
    .values({ name: "Phones" })
    .returning();

  const [laptops] = await db
    .insert(productCategories)
    .values({ name: "Laptops" })
    .returning();

  const [tablets] = await db
    .insert(productCategories)
    .values({ name: "Tablets" })
    .returning();

  const [accessories] = await db
    .insert(productCategories)
    .values({ name: "Accessories" })
    .returning();



  await db.insert(productOffers).values([
    
    {
      supplierId: supplier.id,
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
      supplierId: supplier.id,
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
      supplierId: supplier.id,
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
      supplierId: supplier.id,
      categoryId: laptops.id,
      code: "XPS13-I7",
      name: "Dell XPS 13",
      description: "Dell XPS 13, Intel i7",
      imageUrl: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/dell-plus/db16255/media-gallery/non-touch/laptop-dell-plus-db16255nt-ice-bl-fpr-gallery-5.psd?fmt=png-alpha&pscan=auto&scl=1&hei=804&wid=979&qlt=100,1&resMode=sharp2&size=979,804&chrss=full",
      price: "1100.00",
      width: 29.6,
      height: 19.9,
      depth: 1.5,
    },

    
    {
      supplierId: supplier.id,
      categoryId: tablets.id,
      code: "IPAD-PRO-11",
      name: 'iPad Pro 11"',
      description: "Apple iPad Pro 11-inch",
      imageUrl: "https://superfon.rs/wp-content/uploads/2024/03/iPad-10.9-10th-Gen-Wi-Fi-64GB-Plavi.png.webp",
      price: "900.00",
      width: 24.7,
      height: 17.8,
      depth: 0.6,
    },
    {
      supplierId: supplier.id,
      categoryId: tablets.id,
      code: "TAB-S9",
      name: "Samsung Galaxy Tab S9",
      description: "Samsung Galaxy Tab S9, 128GB",
      imageUrl: "https://images.prismic.io/esis/961a5105-ccf0-4eca-be91-3d7f30e47a3d_image+%283%29.png?auto=compress,format&rect=0,31,1300,975&w=800&h=600",
      price: "650.00",
      width: 25.4,
      height: 16.6,
      depth: 0.6,
    },

    
    {
      supplierId: supplier.id,
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
      supplierId: supplier.id,
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
  ]);

  console.log("Seed done.");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
