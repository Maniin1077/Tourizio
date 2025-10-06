import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from "@angular/core";
import { Router } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";

interface Destination {
  id: number;
  name: string;
  image: string;
  description: string;
}

interface CarouselImage {
  src: string;
  alt: string;
}

interface Testimonial {
  name: string;
  avatar: string;
  rating: string;
  comment: string;
}

interface Vehicle {
  name: string;
  image: string;
  description: string;
}

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  // ===== HERO SECTION =====
  title = "Welcome to Tourizio — Your Gateway to Unforgettable Journeys!";
  displaySubtitle = "";
  showCursor = true;

  private typingSpeed = 100;
  private eraseSpeed = 50;
  private pauseAfterTyping = 2000;
  private pauseAfterErasing = 1000;
  private subtitle =
    "Discover amazing destinations, plan seamless trips, and create memories that last!";
  private typingTimer: any = null;
  private erasingTimer: any = null;
  private pauseTimer: any = null;

  // ===== CAROUSEL =====
  carouselImages: CarouselImage[] = [
    { src: "assets/images/img1.jpg", alt: "Tour Place 1" },
    { src: "assets/images/img2.jpg", alt: "Tour Place 2" },
    { src: "assets/images/img3.jpg", alt: "Tour Place 3" },
    { src: "assets/images/img4.jpg", alt: "Tour Place 4" },
    { src: "assets/images/img5.jpg", alt: "Tour Place 5" },
    { src: "assets/images/img6.jpg", alt: "Tour Place 6" },
  ];
  carouselIndex = 0;
  carouselTimer: any = null;
  carouselInterval = 4500;

  // ===== FEATURED DESTINATIONS =====
  featuredDestinations = []; 

selectedCategory: any = null;

vehicleCategories = [
  {
    type: 'Cars / SUVs',
    image: 'assets/images/car.jpeg',
    details: [
      { seater: '4 seater', model: 'Maruti Alto K10' },
      { seater: '6 seater', model: 'Tata Nexon' },
      { seater: '7 seater', model: 'Toyota Innova Hycross' },
      { seater: '8 seater', model: 'Toyota Innova Crysta' },
      { seater: '9 seater', model: 'Mahindra Bolero Neo Plus' },
    ]
  },
  {
    type: 'Tempo Vans / Travellers',
    image: 'assets/images/tempo.jpeg',
    details: [
      { seater: '9 seater', model: 'Force Traveller Mini' },
      { seater: '12 seater', model: 'Tata Winger' },
      { seater: '15 seater', model: 'Force Traveller' },
      { seater: '17 seater', model: 'Force Traveller' },
      { seater: '20 seater', model: 'Force Traveller' },
    ]
  },
  {
    type: 'Bikes',
    image: 'assets/images/bike.jpeg',
    details: [
      { seater: '2 seater', model: 'Royal Enfield Classic 350' },
      { seater: '2 seater', model: 'Honda CB350 H’ness' },
      { seater: '2 seater', model: 'Bajaj Avenger 220' },
    ]
  }
];

openVehicleDetails(category: any) {
  this.selectedCategory = category;
}

closePopup() {
  this.selectedCategory = null;
}


  // ===== TESTIMONIALS =====
  testimonials: Testimonial[] = [
    {
      name: "Naa Anveshana",
      avatar: "data:image/jpeg;base64,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",
      rating: "★★★★★",
      comment:
        "Amazing experience! The guided tours and local tips made our trip unforgettable.",
    },
    {
      name: "Dimpi Sanghvi",
      avatar: "data:image/jpeg;base64,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",
      rating: "★★★★★",
      comment:
        "Booking was seamless and the destinations recommended were perfect for families.",
    },
    {
      name: "Harsha Sai",
      avatar: "data:image/jpeg;base64,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",
      rating: "★★★★★",
      comment:
        "Loved the adventure trips! Everything was well organized and stress-free.",
    },
  ];

  // ===== SCROLL REVEAL =====
  private scrollRevealElements: NodeListOf<HTMLElement> | null = null;
  private scrollListener: () => void = () => {};
  private resizeListener: () => void = () => {};
  private animationFrame: number | null = null;
private ticking = false;
selectedPlace: Vehicle | null = null;

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ===== INITIALIZATION =====
  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startTypingLoop();
      this.startCarousel();
    }

    try {
      const res = await fetch("assets/data/featured-destinations.json");
      const data = await res.json();
      this.featuredDestinations = data.featuredDestinations || [];
    } catch (error) {
      console.error("Error loading featured destinations:", error);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initScrollReveal();
        this.addInteractionEffects();
      }, 100);
    }
  }

  ngOnDestroy() {
    this.cleanupTypingAnimation();
    this.cleanupCarousel();
    this.cleanupScrollReveal();
  }

  // ===== TYPING ANIMATION =====
  private startTypingLoop() {
    this.typeText(this.subtitle, () => {
      this.pauseTimer = setTimeout(() => {
        this.eraseText(() => {
          this.pauseTimer = setTimeout(() => {
            this.startTypingLoop();
          }, this.pauseAfterErasing);
        });
      }, this.pauseAfterTyping);
    });
  }

  private typeText(text: string, callback?: () => void) {
    let i = 0;
    this.displaySubtitle = "";
    this.typingTimer = setInterval(() => {
      this.displaySubtitle += text.charAt(i++);
      if (i >= text.length) {
        this.clearIntervalSafe("typingTimer");
        callback?.();
      }
    }, this.typingSpeed);
  }

  private eraseText(callback?: () => void) {
    let i = this.displaySubtitle.length;
    this.erasingTimer = setInterval(() => {
      this.displaySubtitle = this.displaySubtitle.slice(0, i--);
      if (i <= 0) {
        this.clearIntervalSafe("erasingTimer");
        callback?.();
      }
    }, this.eraseSpeed);
  }

  pauseTypingAnimation() {
    this.cleanupTypingAnimation();
  }

  resumeTypingAnimation() {
    if (isPlatformBrowser(this.platformId)) {
      this.startTypingLoop();
    }
  }

  private cleanupTypingAnimation() {
    this.clearIntervalSafe("typingTimer");
    this.clearIntervalSafe("erasingTimer");
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
  }

  private clearIntervalSafe(timerName: "typingTimer" | "erasingTimer") {
    if (this[timerName]) {
      clearInterval(this[timerName]);
      this[timerName] = null;
    }
  }

  // ===== CAROUSEL =====
  private startCarousel() {
    this.carouselTimer = setInterval(() => {
      this.carouselIndex =
        (this.carouselIndex + 1) % this.carouselImages.length;
    }, this.carouselInterval);
  }

  private cleanupCarousel() {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
      this.carouselTimer = null;
    }
  }

  // ===== SCROLL REVEAL & INTERACTIONS =====
  private initScrollReveal() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.scrollRevealElements =
      this.elementRef.nativeElement.querySelectorAll(".scroll-reveal");

    this.scrollListener = () => this.optimizedScrollReveal();
    this.resizeListener = () => this.optimizedScrollReveal();

    window.addEventListener("scroll", this.scrollListener, { passive: true });
    window.addEventListener("resize", this.resizeListener, { passive: true });

    this.revealOnScroll();
  }

  private optimizedScrollReveal() {
    if (!this.ticking) {
      this.animationFrame = requestAnimationFrame(() => {
        this.revealOnScroll();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  private revealOnScroll() {
    if (!this.scrollRevealElements) return;

    const windowHeight = window.innerHeight;
    const scrollTop = window.pageYOffset;

    this.scrollRevealElements.forEach((el) => {
      const elementTop = el.offsetTop;
      const revealPoint = 120;
      if (scrollTop + windowHeight - revealPoint > elementTop) {
        const delay = parseFloat(el.style.transitionDelay || "0") * 1000;
        setTimeout(() => el.classList.add("show"), delay);
      }
    });
  }

  private cleanupScrollReveal() {
    if (!isPlatformBrowser(this.platformId)) return;

    window.removeEventListener("scroll", this.scrollListener);
    window.removeEventListener("resize", this.resizeListener);

    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }

  private addInteractionEffects() {
    // Add any card hover/focus effects if required
  }

  // ===== NAVIGATION =====
  goToDestinations() {
    this.router.navigate(["/destinations"]);
  }

  goToBlog() {
    this.router.navigate(["/blog"]);
  }
}
