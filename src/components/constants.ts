import { IngredientType } from './Ingredient';

// Enhanced ingredient types with much more variety for better visual appeal
export const ingredientTypes: Record<string, string[]> = {
  monad_transfer: ['🍅', '🥕', '🥦', '🥔', '🌽', '🧅', '🍄', '🥒', '🥬', '🍆', '🧄', '🥑', '🌶️', '🍋', '🍌', '🍎', '🍒', '🍇', '🍑', '🍓', '🫐'],
  contract_deploy: ['🦑', '🦀', '🦞', '🦐', '🐟', '🥩', '🥓', '🧀', '🥚', '🥛', '🐔', '🍗', '🍖'],
  uniswap_swap: ['🍤', '🍣', '🍱', '🍚', '🍜', '🍝', '🍲', '🥘', '🥗', '🍛'],
  defi_staking: ['🌿', '🧂', '🌱', '🍀', '🌲', '🍦', '🍰', '🧁', '🎂'],
  defi_lending: ['🥨', '🥖', '🫓', '🥪', '🌯', '🫔', '🥧', '🍮', '🍯', '🥜'],
  nft_mint: ['🍭', '🍬', '🍫', '🍩', '🍪', '🍧', '🍨', '🍦', '🍰', '🧁'],
  nft_transfer: ['🍬', '🍫', '🍩', '🍪', '🍧', '🍨', '🍦', '🍰', '🧁', '🍭'],
  unknown: ['🍅', '🥕', '🥦', '🥔', '🌽', '🧅', '🍄', '🥒', '🥬', '🍆', '🧄', '🥑', '🌶️', '🍋', '🍌', '🍎', '🍒', '🍇', '🍑', '🍓', '🫐'],
};

// Enhanced dish types with more variety
export const dishTypes = [
  // Traditional dishes
  '🍝', '🍲', '🥗', '🍛', '🥘', '🍜', '🍕', '🥙', '🌮', '🍱',
  '🍳', '🥞', '🧆', '🫕', '🥣',
  
  // Gourmet dishes (for high-value blocks)
  '🦞', '🍣', '🍤', '🥟', '🍢', '🍡', '🧁', '🎂', '🍰', '🧈',
  
  // International cuisine
  '🥨', '🥖', '🫓', '🥪', '🌯', '🫔', '🥧', '🍮', '🍯', '🥜',
  
  // Special occasion dishes
  '🎉', '✨', '🏆', '👑', '💎', '🌟', '🔥', '⚡', '🚀', '💫'
];

// Animation constants optimized for Monad's ultra-fast blocks (500ms)
export const ANIMATION_CONFIG = {
  ingredientSpawnInterval: 100, // ms - much faster spawn for Monad's speed
  ingredientFlightDuration: 800, // ms - faster flight to match block time
  blockSize: 50, // Max ingredients to show per block for smooth performance
  chefAnimationDuration: 400, // ms - faster chef hand movements
  ingredientsPerBatch: 5, // Reduced ingredients per batch to avoid messiness
  staggerDelay: 50, // ms - tighter stagger for rapid succession
  handAnimationDuration: 300, // ms - quick hand movements
  dishFlightDuration: 1000, // ms - original dish animation duration
  dishCompletionDuration: 500, // ms - faster dish completion animation
};

// Top-view cooking area configuration with multiple bowls
export const COOKING_AREA_CONFIG = {
  // Multiple cooking bowls - better positioned across the cooking area
  bowls: [
    {
      id: 'bowl1',
      centerX: 150,
      centerY: 100,
      width: 120,
      height: 120,
      color: 'from-[#fff] to-[#F9D923]/40',
      borderColor: 'border-[#2B185A]'
    },
    {
      id: 'bowl2',
      centerX: 400,
      centerY: 100,
      width: 120,
      height: 120,
      color: 'from-[#fff] to-[#F9D923]/40',
      borderColor: 'border-[#2B185A]'
    },
    {
      id: 'bowl3',
      centerX: 650,
      centerY: 100,
      width: 120,
      height: 120,
      color: 'from-[#fff] to-[#F9D923]/40',
      borderColor: 'border-[#2B185A]'
    },
    {
      id: 'bowl4',
      centerX: 150,
      centerY: 280,
      width: 120,
      height: 120,
      color: 'from-[#fff] to-[#F9D923]/40',
      borderColor: 'border-[#2B185A]'
    },
    {
      id: 'bowl5',
      centerX: 400,
      centerY: 280,
      width: 120,
      height: 120,
      color: 'from-[#fff] to-[#F9D923]/40',
      borderColor: 'border-[#2B185A]'
    },
    {
      id: 'bowl6',
      centerX: 650,
      centerY: 280,
      width: 120,
      height: 120,
      color: 'from-[#fff] to-[#F9D923]/40',
      borderColor: 'border-[#2B185A]'
    }
  ],
  
  // Legacy pan config (for compatibility)
  panCenterX: 400,
  panCenterY: 200,
  panWidth: 180,
  panHeight: 180,
  
  // Left hand (ingredient throwing)
  leftHandStartX: 50,
  leftHandStartY: 150,
  leftHandThrowX: 320, // Closer to pan edge
  leftHandThrowY: 180,
  
  // Right hand (dish removal)
  rightHandStartX: 750,
  rightHandStartY: 150,
  rightHandGrabX: 480, // Closer to pan edge
  rightHandGrabY: 180,
  
  // Ingredient spawn area (left side)
  ingredientSpawnMinX: 10,
  ingredientSpawnMaxX: 80,
  ingredientSpawnMinY: 50,
  ingredientSpawnMaxY: 350,
  
  // Completed dish destination (right side)
  dishDestinationX: 800,
  dishDestinationY: 150,
};

// Hand animation states
export const HAND_STATES = {
  IDLE: 'IDLE',
  THROWING: 'THROWING',
  GRABBING: 'GRABBING',
  MOVING: 'MOVING'
} as const;

// Enhanced ingredient categorization for better visual variety
export const INGREDIENT_CATEGORIES = {
  BASIC: ['🍅', '🧅', '🥕', '🥔', '🌽'], // Simple transactions
  PREMIUM: ['🦐', '🦞', '🦀', '🥩', '🧀'], // High-value transactions
  EXOTIC: ['🥭', '🥝', '🍍', '🥥', '🐲'], // Rare/special transactions
  SPICES: ['🧂', '🌿', '🌱', '🍀', '🌲'], // Complex smart contracts
  PROTEINS: ['🐔', '🐟', '🦑', '🥚', '🥛'], // DeFi operations
  FRUITS: ['🍎', '🍌', '🍇', '🍓', '🍒'], // NFT operations
} as const;

export const COOKED_DISH_EMOJIS = [
  '🍕', // pizza
  '🍔', // burger
  '🍜', // ramen
  '🍣', // sushi
  '🥘', // paella
  '🥞', // pancakes
  '🍩', // donut
  '🍰', // cake
  '🥗', // salad
  '🍲', // stew
  '🍛', // curry rice
  '🥟', // dumpling
  '🍝', // spaghetti
  '🍤', // fried shrimp
  '🍚', // rice bowl
  '🍱', // bento
  '🍥', // fish cake
  '🍧', // shaved ice
  '🍮', // custard
  '🍦', // ice cream
  '🍨', // sundae
  '🍖', // meat on bone
  '🍗', // chicken leg
  '🍕', // pizza (repeat for more randomness)
  '🍔', // burger
  '🍜', // ramen
  '🍣', // sushi
  '🥘', // paella
  '🥞', // pancakes
  '🍩', // donut
  '🍰', // cake
];