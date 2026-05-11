import { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import gsap from 'gsap';
import * as THREE from 'three';

type GalleryItem = {
  src: string;
  title: string;
  subtitle: string;
  alt: string;
};

type CardRuntime = {
  index: number;
  group: THREE.Group;
  material: THREE.MeshStandardMaterial;
  entry: { value: number };
  hover: { value: number };
  selected: { value: number };
};

const galleryItems: GalleryItem[] = [
  {
    src: '/chef_plating.jpg',
    title: 'Signature Dishes',
    subtitle: 'Plated with precision, warmth, and depth.',
    alt: 'Chef plating a signature dish',
  },
  {
    src: '/dining_room.jpg',
    title: 'Fine Dining Experience',
    subtitle: 'A refined dining room with cinematic ambiance.',
    alt: 'Elegant dining room interior',
  },
  {
    src: '/kitchen_team.jpg',
    title: 'Kitchen Craftsmanship',
    subtitle: 'A behind-the-scenes look at the craft.',
    alt: 'Chefs working in the kitchen',
  },
  {
    src: '/room-interior.webp',
    title: 'Royal Atmosphere',
    subtitle: 'Warm lighting, brass tones, and quiet luxury.',
    alt: 'Luxury restaurant interior',
  },
  {
    src: '/RoyalAmbiance.png',
    title: 'Signature Ambiance',
    subtitle: 'A space designed for arrival and anticipation.',
    alt: 'Restaurant ambiance with warm lighting',
  },
  {
    src: '/SignaturePlating.png',
    title: 'Plating Details',
    subtitle: 'Elegant composition with a premium finish.',
    alt: 'Signature plating presentation',
  },
  {
    src: '/heroimg.png',
    title: 'Arrival Moment',
    subtitle: 'A first impression with depth and presence.',
    alt: 'Restaurant hero interior',
  },
  {
    src: '/heroimg2.png',
    title: 'Evening Glow',
    subtitle: 'Soft contrast and a luxury mood.',
    alt: 'Luxury restaurant scene at dusk',
  },
];

const loadTexture = (src: string) =>
  new Promise<THREE.Texture>((resolve, reject) => {
    new THREE.TextureLoader().load(
      src,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        texture.needsUpdate = true;
        resolve(texture);
      },
      undefined,
      reject,
    );
  });

const supportsWebGL = () => {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

// FIX: Removed the `window.innerWidth < 768` check entirely.
// That was the root cause — DevTools side-docking shrinks the viewport below 768px,
// triggering a teardown. We only gate on WebGL support and reduced-motion preference.
const shouldUseThree = () => {
  if (typeof window === 'undefined') return false;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return supportsWebGL() && !motionQuery.matches;
};

const GalleryFallbackGrid = () => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {galleryItems.map((item, index) => (
      <div
        key={item.src}
        className={`group relative overflow-hidden rounded-[28px] border border-[#e2c8a0] bg-[#fff6e8] shadow-[0_16px_38px_rgba(148,103,57,0.18)] ${index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`}
      >
        <div className={index === 0 ? 'aspect-[1.35/1]' : 'aspect-[0.9/1]'}>
          <img
            src={item.src}
            alt={item.alt}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,245,231,0.7)_60%,rgba(235,215,187,0.96)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="font-serif text-[clamp(20px,3vw,30px)] leading-none text-[#5b351a]">{item.title}</p>
          <p className="mt-2 max-w-md text-sm text-[#6f4a2a]/85">{item.subtitle}</p>
        </div>
      </div>
    ))}
  </div>
);

export const GallerySection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const previewBackdropRef = useRef<HTMLDivElement | null>(null);
  const previewPanelRef = useRef<HTMLDivElement | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // FIX: Compute useThreeMode once on mount and never change it again.
  // This prevents DevTools resize events from toggling the mode and nuking the scene.
  const [useThreeMode] = useState(() => shouldUseThree());
  const [isSceneReady, setIsSceneReady] = useState(false);

  const activeItem = useMemo(() => galleryItems[activeIndex] ?? galleryItems[0], [activeIndex]);
  const previewItem = previewIndex !== null ? galleryItems[previewIndex] : null;

  useEffect(() => {
    if (!introRef.current) return;

    const ctx = gsap.context(() => {
      const targets = Array.from(introRef.current?.querySelectorAll('[data-gallery-hero]') ?? []);
      if (targets.length === 0) return;

      gsap.fromTo(
        targets,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 },
      );
    }, introRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!useThreeMode || !sectionRef.current || !canvasHostRef.current) return;

    let disposed = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let rafId = 0;
    let scrollRafId = 0;
    let scrollUpdateScheduled = false;
    let lastFrameTime = 0;

    
    const runtime = {
      scrollRotation: 0,
      dragRotation: 0,
      cameraZ: 10.5,
      hoveredIndex: -1,
      activeIndex: 0,
      isDragging: false,
      isAutoPaused: false,
      startX: 0,
      lastX: 0,
      dragDistance: 0,
      previewIndex: -1,
    };

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const cardRuntimes: CardRuntime[] = [];
    const angleStep = (Math.PI * 2) / galleryItems.length;

    const fallbackTextureSrc = '/room-interior.webp';
    const scrollRotationTo = gsap.quickTo(runtime, 'scrollRotation', {
      duration: 0.45,
      ease: 'power2.out',
    });
    const cameraZTo = gsap.quickTo(runtime, 'cameraZ', {
      duration: 0.45,
      ease: 'power2.out',
    });

    // FIX: onResize now reads the host element's actual dimensions every time,
    // which correctly handles DevTools panels opening/closing.
    const onResize = () => {
      if (!renderer || !camera || !canvasHostRef.current) return;
      const width = canvasHostRef.current.clientWidth;
      const height = canvasHostRef.current.clientHeight;
      if (width === 0 || height === 0) return; // guard against zero-size during DevTools transitions
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false); // false = don't set CSS size, avoids feedback loops
      scheduleScrollUpdate();
    };

    const updateScrollProgress = () => {
      if (disposed || !sectionRef.current) return;

      const sectionRect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const totalDistance = sectionRect.height + viewportHeight;
      const currentDistance = viewportHeight - sectionRect.top;
      const progress = gsap.utils.clamp(0, 1, currentDistance / totalDistance);

      scrollRotationTo(-progress * Math.PI * 1.45);
      cameraZTo(10.5 - progress * 0.5);
    };

    const scheduleScrollUpdate = () => {
      if (scrollUpdateScheduled) return;
      scrollUpdateScheduled = true;
      scrollRafId = window.requestAnimationFrame(() => {
        scrollUpdateScheduled = false;
        updateScrollProgress();
      });
    };

    const updateHover = (index: number) => {
      cardRuntimes.forEach((card) => {
        gsap.to(card.hover, {
          value: card.index === index ? 1 : 0,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: true,
        });
      });
    };

    const updateSelection = (index: number) => {
      runtime.previewIndex = index;
      cardRuntimes.forEach((card) => {
        gsap.to(card.selected, {
          value: card.index === index ? 1 : 0,
          duration: 0.45,
          ease: 'power3.out',
          overwrite: true,
        });
      });
    };

    const snapToNearestCard = () => {
      const totalRotation = runtime.scrollRotation + runtime.dragRotation;
      const nearestIndex = Math.round(-totalRotation / angleStep);
      const snappedRotation = -nearestIndex * angleStep;

      gsap.to(runtime, {
        dragRotation: snappedRotation - runtime.scrollRotation,
        duration: 1.05,
        ease: 'power3.out',
        overwrite: true,
      });
    };

    const openPreview = (index: number) => {
      setPreviewIndex(index);
      updateSelection(index);
    };

    const createScene = async () => {
      const textures = await Promise.all(
        galleryItems.map(async (item): Promise<THREE.Texture> => {
          try {
            return await loadTexture(item.src);
          } catch {
            return await loadTexture(fallbackTextureSrc);
          }
        }),
      );

      if (disposed || !canvasHostRef.current) {
        textures.forEach((texture) => texture.dispose());
        return;
      }

      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(new THREE.Color('#120806'), 18, 40);

      camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 0, runtime.cameraZ);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;

      // FIX: Set canvas style to fill its container absolutely.
      // This makes it immune to layout shifts caused by DevTools opening.
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.inset = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.touchAction = 'none';
      renderer.domElement.style.cursor = 'grab';

      canvasHostRef.current.appendChild(renderer.domElement);

      // Initial size
      onResize();

      const ambient = new THREE.AmbientLight(0xfff0df, 1.35);
      const hemi = new THREE.HemisphereLight(0xfff2df, 0x2a1109, 1.15);
      const key = new THREE.SpotLight(0xffd39a, 4.5, 32, Math.PI / 7, 0.36, 1.1);
      key.position.set(0, 7.8, 8.5);
      key.target.position.set(0, 0, 0);
      const rim = new THREE.DirectionalLight(0x9d5626, 1.2);
      rim.position.set(-5, 2.5, 6);
      const accent = new THREE.PointLight(0xff9b58, 0.8, 14, 1.8);
      accent.position.set(0, 1.3, 5.5);

      scene.add(ambient, hemi, key, key.target, rim, accent);

      const carousel = new THREE.Group();
      scene.add(carousel);

      const radius = 5.8;
      const cardHeight = 3.0;

      textures.forEach((texture, index): void => {
        const imageSource = texture.image;
        const aspect =
          imageSource &&
          typeof imageSource === 'object' &&
          'width' in imageSource &&
          'height' in imageSource
            ? (imageSource as { width: number; height: number }).width /
              (imageSource as { width: number; height: number }).height
            : 1.36;
        const cardWidth = cardHeight * aspect;

        const group = new THREE.Group();
        group.userData = { index };

        const frameGeometry = new THREE.PlaneGeometry(cardWidth + 0.54, cardHeight + 0.54);
        const backgroundGeometry = new THREE.PlaneGeometry(cardWidth + 0.28, cardHeight + 0.28);
        const imageGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);

        const frameMaterial = new THREE.MeshStandardMaterial({
          color: 0x8b4d25,
          roughness: 0.95,
          metalness: 0.05,
          emissive: 0x2d130a,
          emissiveIntensity: 0.2,
          transparent: true,
          opacity: 0.26,
        });

        const backgroundMaterial = new THREE.MeshStandardMaterial({
          color: 0x21100b,
          roughness: 1,
          metalness: 0,
        });

        const imageMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.6,
          metalness: 0.06,
          emissive: 0x130705,
          emissiveIntensity: 0.18,
        });

        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.z = -0.12;
        const backdrop = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
        backdrop.position.z = -0.06;
        const image = new THREE.Mesh(imageGeometry, imageMaterial);
        image.position.z = 0.01;

        group.add(frame, backdrop, image);
        carousel.add(group);

        const runtimeCard: CardRuntime = {
          index,
          group,
          material: imageMaterial,
          entry: { value: 0.05 },
          hover: { value: 0 },
          selected: { value: 0 },
        };

        cardRuntimes.push(runtimeCard);
        gsap.to(runtimeCard.entry, {
          value: 1,
          duration: 1.15,
          delay: index * 0.08,
          ease: 'expo.out',
        });
      });

      const animate = () => {
        if (disposed) return;

        const now = performance.now();
        const delta = lastFrameTime ? Math.min(0.05, (now - lastFrameTime) / 1000) : 0;
        lastFrameTime = now;

        if (!runtime.isDragging && !runtime.isAutoPaused) {
          runtime.dragRotation -= 0.18 * delta;
        }

        const totalRotation = runtime.scrollRotation + runtime.dragRotation;
        const anglePerCard = (Math.PI * 2) / galleryItems.length;

        cardRuntimes.forEach((card) => {
          const angle = totalRotation + card.index * anglePerCard;
          const normalizedDistance = Math.min(Math.abs(angle) / Math.PI, 1);
          const focus = 1 - normalizedDistance;

          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius - radius;
          const y = Math.sin(angle * 0.55) * 0.12;

          card.group.position.set(x, y, z + card.selected.value * 0.85);
          card.group.lookAt(0, 0, 0);

          const entryBoost = 0.5 + card.entry.value * 0.5;
          const scale =
            (0.9 + focus * 0.22 + card.hover.value * 0.12 + card.selected.value * 0.2) * entryBoost;
          card.group.scale.setScalar(scale);

          card.material.emissiveIntensity =
            0.12 + focus * 0.28 + card.hover.value * 0.2 + card.selected.value * 0.42;
        });

        const nextActiveIndex = cardRuntimes.reduce((best, card) => {
          const angle = totalRotation + card.index * anglePerCard;
          const score = 1 - Math.min(Math.abs(angle) / Math.PI, 1);
          const bestAngle = totalRotation + best * anglePerCard;
          const bestScore = 1 - Math.min(Math.abs(bestAngle) / Math.PI, 1);
          return score > bestScore ? card.index : best;
        }, 0);

        if (nextActiveIndex !== runtime.activeIndex) {
          runtime.activeIndex = nextActiveIndex;
          setActiveIndex(nextActiveIndex);
        }

        camera!.position.z = gsap.utils.interpolate(camera!.position.z, runtime.cameraZ, 0.06);
        camera!.position.y = gsap.utils.interpolate(camera!.position.y, 0, 0.05);
        camera!.lookAt(0, 0, 0);

        renderer!.render(scene!, camera!);
        rafId = window.requestAnimationFrame(animate);
      };

      animate();
      setIsSceneReady(true);

      // FIX: Use ResizeObserver on the canvas host element instead of window resize.
      // ResizeObserver fires correctly when the host element's actual size changes,
      // whether from DevTools, browser zoom, or window resize — without false positives.
      const resizeObserver = new ResizeObserver(() => {
        onResize();
      });
      resizeObserver.observe(canvasHostRef.current);

      window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
      window.addEventListener('orientationchange', scheduleScrollUpdate);
      scheduleScrollUpdate();

      // Entry animation
      const loadTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (introRef.current) {
        loadTl.fromTo(
          introRef.current.querySelectorAll('[data-gallery-hero]'),
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 },
          0,
        );
      }
      if (canvasHostRef.current) {
        loadTl.fromTo(
          canvasHostRef.current,
          { opacity: 0, scale: 0.98, y: 24 },
          { opacity: 1, scale: 1, y: 0, duration: 1.05, ease: 'expo.out' },
          0.1,
        );
      }

      // Pointer events
      const handlePointerMove = (event: PointerEvent) => {
        if (!renderer || !camera) return;

        const bounds = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);

        if (runtime.isDragging) {
          const deltaX = event.clientX - runtime.lastX;
          runtime.dragRotation += deltaX * 0.008;
          runtime.dragDistance += Math.abs(deltaX);
          runtime.lastX = event.clientX;
          renderer.domElement.style.cursor = 'grabbing';
          return;
        }

        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(
          cardRuntimes.map((card) => card.group),
          true,
        );
        const hitObject = hits[0]?.object;
        let hitGroup: THREE.Group | null = null;
        if (hitObject) {
          let obj: THREE.Object3D | null = hitObject;
          while (obj) {
            if (obj.userData?.index !== undefined) {
              hitGroup = obj as THREE.Group;
              break;
            }
            obj = obj.parent;
          }
        }
        const nextIndex = hitGroup?.userData?.index ?? -1;

        if (nextIndex !== runtime.hoveredIndex) {
          runtime.hoveredIndex = nextIndex;
          updateHover(nextIndex);
          renderer.domElement.style.cursor = nextIndex >= 0 ? 'pointer' : 'grab';
          runtime.isAutoPaused = nextIndex >= 0;
        }
      };

      const handlePointerDown = (event: PointerEvent) => {
        runtime.isDragging = true;
        runtime.isAutoPaused = true;
        runtime.startX = event.clientX;
        runtime.lastX = event.clientX;
        runtime.dragDistance = 0;
        renderer!.domElement.style.cursor = 'grabbing';
      };

      const handlePointerUp = () => {
        if (!runtime.isDragging) return;
        runtime.isDragging = false;
        runtime.isAutoPaused = runtime.hoveredIndex >= 0;
        renderer!.domElement.style.cursor = runtime.hoveredIndex >= 0 ? 'pointer' : 'grab';

        if (runtime.dragDistance < 8 && runtime.hoveredIndex >= 0) {
          openPreview(runtime.hoveredIndex);
          return;
        }
        snapToNearestCard();
      };

      const handlePointerLeave = () => {
        runtime.hoveredIndex = -1;
        updateHover(-1);
        runtime.isDragging = false;
        runtime.isAutoPaused = false;
        renderer!.domElement.style.cursor = 'grab';
      };

      const handleClick = () => {
        if (runtime.hoveredIndex >= 0 && !runtime.isDragging) {
          openPreview(runtime.hoveredIndex);
        }
      };

      renderer.domElement.addEventListener('pointermove', handlePointerMove);
      renderer.domElement.addEventListener('pointerdown', handlePointerDown);
      renderer.domElement.addEventListener('pointerup', handlePointerUp);
      renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.addEventListener('click', handleClick);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('scroll', scheduleScrollUpdate);
        window.removeEventListener('orientationchange', scheduleScrollUpdate);
        renderer?.domElement.removeEventListener('pointermove', handlePointerMove);
        renderer?.domElement.removeEventListener('pointerdown', handlePointerDown);
        renderer?.domElement.removeEventListener('pointerup', handlePointerUp);
        renderer?.domElement.removeEventListener('pointerleave', handlePointerLeave);
        renderer?.domElement.removeEventListener('click', handleClick);
      };
    };

    const listenerCleanupPromise = createScene();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(scrollRafId);
      window.cancelAnimationFrame(rafId);
      gsap.killTweensOf(runtime);

      listenerCleanupPromise.then((cleanup) => cleanup?.()).catch(() => undefined);

      if (renderer) {
        // FIX: Remove the canvas from the DOM before disposing the renderer.
        // Without this, a stale canvas element lingers in the host div, and if
        // the effect re-runs (e.g. React StrictMode), a second canvas gets appended
        // on top of the orphaned one.
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer.dispose();
        renderer = null;
      }
      scene = null;
      camera = null;
      setIsSceneReady(false);
    };
  }, [useThreeMode]);

  useEffect(() => {
    if (previewIndex === null || !previewBackdropRef.current || !previewPanelRef.current) return;

    const tl = gsap.timeline();
    tl.fromTo(previewBackdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
    tl.fromTo(
      previewPanelRef.current,
      { opacity: 0, scale: 0.92, y: 28 },
      { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'expo.out' },
      0,
    );

    return () => {
      tl.kill();
    };
  }, [previewIndex]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (previewIndex !== null) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [previewIndex]);

  const closePreview = () => {
    if (!previewBackdropRef.current || !previewPanelRef.current) {
      setPreviewIndex(null);
      return;
    }

    gsap.to(previewPanelRef.current, {
      opacity: 0,
      scale: 0.94,
      y: 20,
      duration: 0.25,
      ease: 'power2.in',
    });
    gsap.to(previewBackdropRef.current, {
      opacity: 0,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => setPreviewIndex(null),
    });
  };

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="relative isolate w-full overflow-hidden scroll-mt-24 px-6 py-12 sm:px-10 sm:py-14 lg:px-16 lg:py-16 xl:px-24"
      style={{
        background: `
          radial-gradient(circle at 15% 20%, rgba(255, 244, 222, 0.9), transparent 55%),
          radial-gradient(circle at 85% 25%, rgba(255, 214, 163, 0.6), transparent 50%),
          radial-gradient(circle at 50% 90%, rgba(220, 170, 110, 0.35), transparent 55%),
          linear-gradient(135deg, #fff7e9 0%, #f7ead3 35%, #f1dcc1 70%, #fff4e6 100%)
        `,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.6),transparent_32%),radial-gradient(circle_at_80%_78%,rgba(248,208,150,0.35),transparent_40%)]" />

      <div ref={introRef} className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-8 max-w-4xl">
          <div>
            <div
              data-gallery-hero
              className="inline-flex items-center gap-2 rounded-full border border-[#e2c19a]/70 bg-[#fff4e2]/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7a4a26] backdrop-blur"
            >
              <Sparkles size={14} /> Cinematic Gallery
            </div>
            <h2
              data-gallery-hero
              className="mt-4 font-serif text-[clamp(34px,4.8vw,64px)] leading-[0.92] text-[#5b341a]"
            >
              A visual story of your dining experience.
            </h2>
            <p
              data-gallery-hero
              className="mt-4 max-w-2xl text-[14px] leading-relaxed text-[#6f4a2a]/85 sm:text-base"
            >
              Discover signature moments from our kitchen and dining room in an immersive, elegant gallery.
            </p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-1">
          {/* FIX: Added `position: relative` to the host div so the absolutely-positioned
              canvas fills it correctly regardless of how DevTools reshapes the viewport. */}
          <div
            ref={canvasHostRef}
            className={`relative min-h-[420px] sm:min-h-[470px] lg:min-h-[520px] overflow-hidden rounded-[30px] border border-[#e2c19a]/60 bg-[linear-gradient(180deg,rgba(255,252,246,0.92)_0%,rgba(251,241,228,0.82)_45%,rgba(238,219,191,0.7)_100%)] shadow-[0_24px_70px_rgba(138,96,52,0.18)] ${useThreeMode ? '' : 'flex items-center justify-center p-5 sm:p-6'}`}
          >
            {!useThreeMode && <GalleryFallbackGrid />}

            {useThreeMode && !isSceneReady && (
              <div className="absolute inset-0 flex items-center justify-center text-[#6f4a2a]/85">
                <div className="rounded-full border border-[#e2c19a]/60 bg-[#fff4e2]/80 px-5 py-3 text-sm tracking-[0.2em] uppercase">
                  Loading gallery
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-[linear-gradient(180deg,transparent_0%,rgba(255,244,228,0.55)_35%,rgba(240,222,196,0.95)_100%)] px-6 pb-6 pt-20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a5b33]/75">
                    Featured frame
                  </p>
                  <h3 className="mt-2 font-serif text-[clamp(22px,3.2vw,36px)] leading-none text-[#5b341a]">
                    {activeItem.title}
                  </h3>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-[#6f4a2a]/85">{activeItem.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewItem && previewIndex !== null && (
        <div ref={previewBackdropRef} className="fixed inset-0 z-[70] bg-black/88 backdrop-blur-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,216,150,0.14),transparent_42%)]" />
          <div className="relative z-10 flex h-full items-center justify-center px-4 py-6 sm:px-8">
            <div
              ref={previewPanelRef}
              className="relative w-full max-w-6xl overflow-hidden rounded-[34px] border border-[#f0c57f]/16 bg-[linear-gradient(180deg,rgba(28,12,8,0.96)_0%,rgba(16,8,6,0.98)_100%)] shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
            >
              <button
                type="button"
                onClick={closePreview}
                className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-[#f7e2bc] backdrop-blur transition-colors hover:bg-white/14"
                aria-label="Close gallery preview"
              >
                <X size={18} />
              </button>

              <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
                <div className="relative min-h-[52vh] lg:min-h-[78vh]">
                  <img
                    src={previewItem.src}
                    alt={previewItem.alt}
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.24)_50%,rgba(0,0,0,0.82)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0c57f]/75">
                      Fullscreen preview
                    </p>
                    <h3 className="mt-3 font-serif text-[clamp(30px,5vw,66px)] leading-[0.92] text-[#f7e2bc]">
                      {previewItem.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#edd2a8]/84 sm:text-lg">
                      {previewItem.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-6 border-t border-white/8 bg-black/20 p-6 lg:border-l lg:border-t-0 lg:p-8">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0c57f]/70">
                      {previewIndex + 1} / {galleryItems.length}
                    </p>
                    <div className="mt-4 space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[#f4dfbb]">
                        High-contrast photography, soft shadows, and layered motion create a premium presentation.
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[#f4dfbb]">
                        Swipe, click, or use the cards outside this modal to continue browsing.
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-[#f0c57f]/16 bg-[linear-gradient(180deg,rgba(255,214,150,0.14)_0%,rgba(255,255,255,0.03)_100%)] p-4 text-[#f7e2bc]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f0c57f]/70">
                      Visual story
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#ebd2a9]/78">
                      {previewItem.title} brings the room, the plating, and the atmosphere together in a cinematic
                      frame.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};  