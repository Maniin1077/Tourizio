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
    { src: "assets/images/img1.webp", alt: "Tour Place 1" },
    { src: "assets/images/img2.webp", alt: "Tour Place 2" },
    { src: "assets/images/img3.webp", alt: "Tour Place 3" },
    { src: "assets/images/img4.webp", alt: "Tour Place 4" },
    { src: "assets/images/img5.webp", alt: "Tour Place 5" },
    { src: "assets/images/img6.webp", alt: "Tour Place 6" },
  ];
  carouselIndex = 0;
  carouselTimer: any = null;
  carouselInterval = 4500;

  // ===== FEATURED DESTINATIONS =====
  featuredDestinations: Destination[] = [];

  // ===== TESTIMONIALS =====
  testimonials: Testimonial[] = [
    {
      name: "Alice Johnson",
      avatar: "https://i.pravatar.cc/100?img=3",
      rating: "★★★★★",
      comment:
        "Amazing experience! The guided tours and local tips made our trip unforgettable.",
    },
    {
      name: "Rahul Sharma",
      avatar: "https://i.pravatar.cc/100?img=7",
      rating: "★★★★★",
      comment:
        "Booking was seamless and the destinations recommended were perfect for families.",
    },
    {
      name: "Priya Verma",
      avatar: "https://i.pravatar.cc/100?img=5",
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
