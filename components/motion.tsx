/**
 * Layout wrappers that used to fade content in on scroll.
 *
 * HomeBridge now keeps motion for moments that carry meaning (the hero reveal, the homes
 * index, the how-it-works progress line, the closing panel, and responses to user actions),
 * so these render plain blocks. They are kept so existing pages don't need restructuring.
 */
type BlockProps = React.HTMLAttributes<HTMLDivElement> & { delay?: number; y?: number };

export function Reveal({ delay: _delay, y: _y, ...props }: BlockProps) {
  void _delay;
  void _y;
  return <div {...props} />;
}
