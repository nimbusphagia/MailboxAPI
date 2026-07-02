import "dotenv/config";
import prisma from "../src/config/prisma";

const profilePictures = [
  {
    name: "naked_cat",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002813/iconos-09_pa9wam.jpg",
  },
  {
    name: "blue_cat",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002813/iconos-10_scaswx.jpg",
  },
  {
    name: "white_dog",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002814/iconos-03_jytwpd.jpg",
  },
  {
    name: "black_poodle",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002814/iconos-06_eqrmi3.jpg",
  },
  {
    name: "orange_cat",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002813/iconos-11_tphxkd.jpg",
  },
  {
    name: "black_dog",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002814/iconos-05_lnpo2v.jpg",
  },
  {
    name: "spotted_dog",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002814/iconos-04_mnwzpi.jpg",
  },
  {
    name: "aquatic_turtle",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002813/iconos-12_c7rlph.jpg",
  },
  {
    name: "toad",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002812/iconos-13_mnkzit.jpg",
  },
  {
    name: "turtle",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002812/iconos-14_bx6j53.jpg",
  },
  {
    name: "hyrax",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002812/iconos-15_zbiulh.jpg",
  },
  {
    name: "crab",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002813/iconos-07_ygjer4.jpg",
  },
  {
    name: "lobster",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002813/iconos-08_ckesew.jpg",
  },
  {
    name: "chicken",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002812/iconos-18_jm8y5y.jpg",
  },
  {
    name: "cow",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002812/iconos-17_uop15e.jpg",
  },
  {
    name: "horse",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1783002812/iconos-16_x7ynvi.jpg",
  },
];
async function main() {
  await prisma.profilePicture.createMany({
    data: profilePictures,
    skipDuplicates: true,
  });
  console.log("Profile pictures seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
