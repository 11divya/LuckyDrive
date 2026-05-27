import { useEffect, useRef, useState } from 'react';
import { Carousel } from 'antd';
import {
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

import ApiService from '../services/api';
import { formatAnnouncementDate } from '../utils/format';

export default function AnnouncementCarousel() {
  const carouselRef = useRef(null);
  const [banners, setBanners] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await ApiService.getAnnouncementBanners();
        if (!cancelled) setBanners(data?.banners || []);
      } catch {
        if (!cancelled) setBanners([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (banners === null || banners.length === 0) return null;

  const slideContent = (slide) => (
    <div className="ld-container py-3 md:py-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 min-h-[52px]">
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center">
            <TrophyOutlined />
          </span>
          <span className="font-label-bold text-[10px] text-primary tracking-[0.12em] uppercase hidden sm:inline">
            Winner announcement
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text text-sm md:text-body-md leading-snug">
            {slide.headline}
          </p>
          {slide.message ? (
            <p className="text-text-muted text-xs md:text-sm mt-0.5 line-clamp-2">
              {slide.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm flex-shrink-0">
          {slide.vehicleName ? (
            <span className="text-text-muted">{slide.vehicleName}</span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 text-primary font-bold tabular-nums">
            <CalendarOutlined className="text-xs" />
            {formatAnnouncementDate(slide.announcementDate)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <section
      className="ld-announcement-carousel relative border-b border-outline-variant/20 bg-dark-100"
      aria-label="Winner announcement updates"
    >
      <button
        type="button"
        className="ld-announcement-carousel__arrow ld-announcement-carousel__arrow--prev"
        onClick={() => carouselRef.current?.prev()}
        aria-label="Previous announcement"
      >
        <LeftOutlined />
      </button>
      <button
        type="button"
        className="ld-announcement-carousel__arrow ld-announcement-carousel__arrow--next"
        onClick={() => carouselRef.current?.next()}
        aria-label="Next announcement"
      >
        <RightOutlined />
      </button>

      <Carousel
        ref={carouselRef}
        autoplay={banners.length > 1}
        autoplaySpeed={8000}
        dots={banners.length > 1}
        pauseOnHover
        arrows={false}
      >
        {banners.map((slide) => (
          <div key={slide.id}>{slideContent(slide)}</div>
        ))}
      </Carousel>
    </section>
  );
}
