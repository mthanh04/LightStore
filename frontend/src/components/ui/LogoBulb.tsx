import React, { useEffect, useState } from 'react';
import ledLight from '../../assets/images/leb_light1.png';
import ledDark  from '../../assets/images/led_dark.webp';

interface LogoBulbProps {
  /** Kích thước logo (width = height), mặc định 40px */
  size?: number;
  /** Khoảng thời gian chuyển đổi sáng/tối (ms), mặc định 2500ms */
  interval?: number;
  /** Thời gian transition CSS (ms), mặc định 700ms */
  duration?: number;
}

/**
 * LogoBulb — bóng đèn chuyển đổi sáng ↔ tối mượt mà bằng CSS crossfade.
 * Sử dụng hai <img> xếp chồng nhau, điều khiển opacity bằng transition.
 */
const LogoBulb: React.FC<LogoBulbProps> = ({
  size     = 40,
  interval = 2500,
  duration = 700,
}) => {
  const [isLight, setIsLight] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsLight((prev) => !prev);
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  const transitionStyle: React.CSSProperties = {
    transition: `opacity ${duration}ms ease-in-out`,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  };

  return (
    <div
      aria-label="LightStore logo"
      style={{
        position: 'relative',
        width:  size,
        height: size,
        flexShrink: 0,
      }}
    >
      {/* Hình sáng — led_light */}
      <img
        src={ledLight}
        alt="bulb light"
        style={{
          ...transitionStyle,
          opacity: isLight ? 1 : 0,
        }}
        draggable={false}
      />

      {/* Hình tối — led_dark */}
      <img
        src={ledDark}
        alt="bulb dark"
        style={{
          ...transitionStyle,
          opacity: isLight ? 0 : 1,
        }}
        draggable={false}
      />
    </div>
  );
};

export default LogoBulb;
