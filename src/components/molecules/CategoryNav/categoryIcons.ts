import type { CategoryId } from '../../../lib/categories'
import {
  BrainIcon,
  CloudIcon,
  DatabaseIcon,
  MonitorIcon,
  PaletteIcon,
  ServerIcon,
} from '../../atoms/icons'
import type { IconProps } from '../../atoms/icons'

export const CATEGORY_ICONS: Record<CategoryId, (props: IconProps) => React.JSX.Element> = {
  frontend: MonitorIcon,
  backend: ServerIcon,
  'ai-ml': BrainIcon,
  devops: CloudIcon,
  database: DatabaseIcon,
  design: PaletteIcon,
}
