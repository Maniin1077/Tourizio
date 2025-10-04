// import { Component, OnInit } from "@angular/core";
// import { HttpClient, HttpHeaders } from "@angular/common/http";

// interface BlogPost {
//   id: number;
//   title: string;
//   excerpt: string;
//   content: string;
//   image: string;
//   author: string;
//   authorImage: string;
//   date: string;
//   readTime: string;
//   category: string;
//   likes: number;
//   location: string;
//   tags: string[];
//   liked?: boolean;
//   imageLoaded?: boolean; // ✅ new property for skeleton loader
// }

// @Component({
//   selector: "app-blog",
//   templateUrl: "./blog.component.html",
//   styleUrls: ["./blog.component.scss"],
// })
// export class BlogComponent implements OnInit {
//   selectedCategory: string = "All";
//   currentFeaturedIndex: number = 0;

//   categories = ["All", "Adventure", "Culture", "Food", "Tips", "Nature"];

//   blogPosts: BlogPost[] = [];
//   featuredPosts: BlogPost[] = [];

//   constructor(private http: HttpClient) {}

//   ngOnInit(): void {
//     // ✅ Load posts from JSON instead of hardcoding
//     this.http.get<any>("assets/data/blogs.json").subscribe((data) => {
//       this.blogPosts = data.blogPosts.map((post: BlogPost) => ({
//         ...post,
//         image: "",          // start empty
//         liked: false,       // default like state
//         imageLoaded: false, // for skeleton
//       }));

//       this.featuredPosts = [...this.blogPosts];
//       this.loadImages();
//     });

//     // Auto-rotate carousel every 5 seconds
//     setInterval(() => this.nextFeatured(), 5000);
//   }

//   loadImages() {
//     const API_URL = "https://api.pexels.com/v1/search";
//     const headers = new HttpHeaders({
//       Authorization: "lziGnbzjpGpnwAGAu1KYKuJghDSuOVfworDozfcEESqesyoebEOalcTq",
//     });

//     const queries: { [key: number]: string } = {
//       1: "kerala famous location",
//       2: "delhi street food",
//       3: "himalaya trekking",
//       4: "tamil nadu temples",
//       5: "budget india",
//       6: "amazon rainforest",
//     };

//     this.blogPosts.forEach((post, index) => {
//       const query = queries[post.id] || "india travel";

//       this.http
//         .get<any>(API_URL, {
//           headers,
//           params: { query, per_page: 1 },
//         })
//         .subscribe((res) => {
//           const newImage =
//             res.photos[0]?.src.medium || "https://via.placeholder.com/600x400";
//           this.blogPosts[index].image = newImage;
//           // ✅ mark image as loaded after short delay for skeleton
//           setTimeout(() => (this.blogPosts[index].imageLoaded = true), 50);
//         });
//     });
//   }

//   get filteredPosts() {
//     return this.selectedCategory === "All"
//       ? this.blogPosts
//       : this.blogPosts.filter((p) => p.category === this.selectedCategory);
//   }

//   setCategory(category: string) {
//     this.selectedCategory = category;
//   }

//   nextFeatured() {
//     this.currentFeaturedIndex =
//       (this.currentFeaturedIndex + 1) % this.featuredPosts.length;
//   }

//   prevFeatured() {
//     this.currentFeaturedIndex =
//       (this.currentFeaturedIndex - 1 + this.featuredPosts.length) %
//       this.featuredPosts.length;
//   }

//   toggleLike(post: BlogPost) {
//     if (post.liked) {
//       post.likes--;
//       post.liked = false;
//     } else {
//       post.likes++;
//       post.liked = true;
//     }
//   }
// }
import { Component, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as L from "leaflet";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  authorImage: string;
  date: string;
  readTime: string;
  category: string;
  likes: number;
  location: string;
  tags: string[];
  liked?: boolean;
  imageLoaded?: boolean; // for skeleton loader
}

@Component({
  selector: "app-blog",
  templateUrl: "./blog.component.html",
  styleUrls: ["./blog.component.scss"],
})
export class BlogComponent implements OnInit, AfterViewInit, OnDestroy {
  // --- Category & Carousel ---
  selectedCategory: string = "All";
  currentFeaturedIndex: number = 0;
  categories = ["All", "Adventure", "Culture", "Food", "Tips", "Nature"];
  blogPosts: BlogPost[] = [];
  featuredPosts: BlogPost[] = [];
  carouselInterval: any;

// --- Map ---
public map: L.Map | undefined;
public mapId = "mini-map";  // <-- change 'private' to 'public'
public lat = 20.5937;
public lng = 78.9629;
public zoom = 5;
public markerColor = "#FF5722";
public placeName = "Travel Location";


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadBlogPosts();
    this.startCarouselAutoPlay();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.carouselInterval) clearInterval(this.carouselInterval);
    if (this.map) this.map.remove();
  }

  // ----------------------- Load Blogs & Images -----------------------
  private loadBlogPosts() {
    this.http.get<any>("assets/data/blogs.json").subscribe((data) => {
      this.blogPosts = data.blogPosts.map((post: BlogPost) => ({
        ...post,
        image: "",
        liked: false,
        imageLoaded: false,
        tags: post.tags || [],
      }));
      this.featuredPosts = [...this.blogPosts];
      this.loadImagesFromAPI();
    });
  }

  private loadImagesFromAPI() {
    const API_URL = "https://api.pexels.com/v1/search";
    const headers = new HttpHeaders({
      Authorization:
        "lziGnbzjpGpnwAGAu1KYKuJghDSuOVfworDozfcEESqesyoebEOalcTq",
    });

    const queries: { [key: number]: string } = {
      1: "kerala famous location",
      2: "delhi street food",
      3: "himalaya trekking",
      4: "tamil nadu temples",
      5: "budget india",
      6: "amazon rainforest",
    };

    this.blogPosts.forEach((post, index) => {
      const query = queries[post.id] || "india travel";

      this.http
        .get<any>(API_URL, { headers, params: { query, per_page: "1" } })
        .subscribe((res) => {
          this.blogPosts[index].image =
            res?.photos?.[0]?.src?.medium || "https://via.placeholder.com/600x400";
          setTimeout(() => (this.blogPosts[index].imageLoaded = true), 50);
        });
    });
  }

  // ----------------------- Carousel -----------------------
  private startCarouselAutoPlay() {
    this.carouselInterval = setInterval(() => this.nextFeatured(), 5000);
  }

  nextFeatured() {
    this.currentFeaturedIndex =
      (this.currentFeaturedIndex + 1) % this.featuredPosts.length;
  }

  prevFeatured() {
    this.currentFeaturedIndex =
      (this.currentFeaturedIndex - 1 + this.featuredPosts.length) %
      this.featuredPosts.length;
  }

  // ----------------------- Category Filter -----------------------
  setCategory(category: string) {
    this.selectedCategory = category;
  }

  get filteredPosts() {
    return this.selectedCategory === "All"
      ? this.blogPosts
      : this.blogPosts.filter((p) => p.category === this.selectedCategory);
  }

  // ----------------------- Like Toggle -----------------------
  toggleLike(post: BlogPost) {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
  }

  // ----------------------- Leaflet Mini Map -----------------------
  private initializeMap(): void {
    if (!this.lat || !this.lng) return;
    if (this.map) return;

    const mapElement = document.getElementById(this.mapId);
    if (!mapElement) return;

    this.map = L.map(this.mapId, {
      center: [this.lat, this.lng],
      zoom: this.zoom,
      scrollWheelZoom: false,
      dragging: false,
      zoomControl: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(this.map);

    const marker = L.marker([this.lat, this.lng], {
      icon: this.createCustomIcon(this.markerColor),
    }).addTo(this.map);

    if (this.placeName) marker.bindPopup(`<b>${this.placeName}</b>`).openPopup();
    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  private createCustomIcon(color: string): L.DivIcon {
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });
  }
}
