import "dotenv/config";
import prisma from "../src/config/prisma";

const profilePictures = [
  {
    name: "naked_cat",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782611648/gato_3_e9heqw.png",
  },
  {
    name: "blue_cat",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782611648/gato_2_pye1ik.png",
  },
  {
    name: "white_dog",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782611648/perro_3_slv5wy.png",
  },
  {
    name: "black_poodle",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782611648/perro_4_xbczj4.png",
  },
  {
    name: "orange_cat",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782611648/gato_1_hdkumn.png",
  },
  {
    name: "black_dog",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782611648/perro_2_mgydpm.png",
  },
  {
    name: "spotted_dog",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782611648/perro_1_allu5x.png",
  },
  {
    name: "aquatic_turtle",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782621678/tortugo_jc1vel.png",
  },
  {
    name: "toad",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782621678/sapo_hukcuf.png",
  },
  {
    name: "turtle",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782621679/tortuga_nswedl.png",
  },
  {
    name: "hyrax",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782621710/hyrax_lghocl.png",
  },
  {
    name: "crab",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782621710/cangrejo_ohrtla.png",
  },
  {
    name: "lobster",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782621726/langosta_qzzpwx.png",
  },
  {
    name: "chicken",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782621727/gallo_wh1knh.png",
  },
  {
    name: "cow",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782621728/vaca_i28sdr.png",
  },
  {
    name: "horse",
    url: "https://res.cloudinary.com/dlsa973vu/image/upload/v1782621729/caballo_h1nvxz.png",
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
