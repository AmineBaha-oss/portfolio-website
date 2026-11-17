import Image from 'next/image';
import styles from './style.module.scss';

export default function ProjectPreview({ title, image, color, technologies, label }: {
  title: string; image: string; color: string; technologies: string[]; label: string;
}) {
  return <div className={styles.preview} style={{ backgroundColor: color }}>
    <div className={styles.image}>
      <Image src={image} alt="" fill sizes="440px" style={{ objectFit: 'cover' }} unoptimized />
      <div className={styles.imageShade} />
      <span className={styles.open}>{label}<span aria-hidden="true">↗</span></span>
    </div>
    <div className={styles.caption}>
      <h3>{title}</h3>
      <div className={styles.technologies}>{technologies.slice(0, 3).map(tech => <span key={tech}>{tech}</span>)}</div>
    </div>
  </div>;
}
