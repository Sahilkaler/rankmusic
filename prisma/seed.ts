import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create users
  const users = []
  for (let i = 1; i <= 10; i++) {
    const hashedPassword = await bcrypt.hash("password123", 10)
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        name: `User ${i}`,
        username: `user${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        bio: `This is the bio for User ${i}`,
      },
    })
    users.push(user)
    console.log(`Created user: ${user.username}`)
  }

  // Create albums (using some popular albums as examples)
  const albumData = [
    { title: "Abbey Road", artist: "The Beatles", spotifyId: "seed-album-1" },
    { title: "Dark Side of the Moon", artist: "Pink Floyd", spotifyId: "seed-album-2" },
    { title: "Thriller", artist: "Michael Jackson", spotifyId: "seed-album-3" },
    { title: "The Wall", artist: "Pink Floyd", spotifyId: "seed-album-4" },
    { title: "Back in Black", artist: "AC/DC", spotifyId: "seed-album-5" },
    { title: "Rumours", artist: "Fleetwood Mac", spotifyId: "seed-album-6" },
    { title: "Hotel California", artist: "Eagles", spotifyId: "seed-album-7" },
    { title: "Led Zeppelin IV", artist: "Led Zeppelin", spotifyId: "seed-album-8" },
    { title: "Nevermind", artist: "Nirvana", spotifyId: "seed-album-9" },
    { title: "The Joshua Tree", artist: "U2", spotifyId: "seed-album-10" },
    { title: "OK Computer", artist: "Radiohead", spotifyId: "seed-album-11" },
    { title: "Purple Rain", artist: "Prince", spotifyId: "seed-album-12" },
    { title: "Appetite for Destruction", artist: "Guns N' Roses", spotifyId: "seed-album-13" },
    { title: "The Chronic", artist: "Dr. Dre", spotifyId: "seed-album-14" },
    { title: "Revolver", artist: "The Beatles", spotifyId: "seed-album-15" },
    { title: "Born to Run", artist: "Bruce Springsteen", spotifyId: "seed-album-16" },
    { title: "London Calling", artist: "The Clash", spotifyId: "seed-album-17" },
    { title: "Pet Sounds", artist: "The Beach Boys", spotifyId: "seed-album-18" },
    { title: "The Rise and Fall of Ziggy Stardust", artist: "David Bowie", spotifyId: "seed-album-19" },
    { title: "Kind of Blue", artist: "Miles Davis", spotifyId: "seed-album-20" },
  ]

  const albums = []
  for (const data of albumData) {
    const album = await prisma.album.upsert({
      where: { spotifyId: data.spotifyId },
      update: {},
      create: {
        spotifyId: data.spotifyId,
        title: data.title,
        artist: data.artist,
        releaseDate: "1970-01-01",
        coverUrl: null,
        genres: [],
      },
    })
    albums.push(album)
    console.log(`Created album: ${album.title}`)
  }

  // Create ratings
  const ratingTypes = ["SKIP", "TIMEPASS", "GOOD", "PERFECTION"] as const
  let ratingCount = 0

  for (const user of users) {
    // Each user rates 5-10 random albums
    const albumsToRate = albums
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 6) + 5)

    for (const album of albumsToRate) {
      const rating = ratingTypes[Math.floor(Math.random() * ratingTypes.length)]
      await prisma.rating.upsert({
        where: {
          userId_albumId: {
            userId: user.id,
            albumId: album.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          albumId: album.id,
          rating,
        },
      })
      ratingCount++
    }
  }

  console.log(`Created ${ratingCount} ratings`)

  // Create some follow relationships
  let followCount = 0
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    // Each user follows 2-4 other users
    const usersToFollow = users
      .filter((u) => u.id !== user.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 2)

    for (const followUser of usersToFollow) {
      try {
        await prisma.follow.upsert({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId: followUser.id,
            },
          },
          update: {},
          create: {
            followerId: user.id,
            followingId: followUser.id,
          },
        })
        followCount++
      } catch (error) {
        // Ignore duplicate follows
      }
    }
  }

  console.log(`Created ${followCount} follow relationships`)
  console.log("✅ Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


