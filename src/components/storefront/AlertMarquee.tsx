import Marquee from 'react-fast-marquee'

interface AlertMarqueeProps {
  text: string
  primaryColor: string
}

export const AlertMarquee = ({ text, primaryColor }: AlertMarqueeProps) => {
  return (
    <div className="bg-primary text-primary-foreground">
      <Marquee autoFill gradient gradientColor={primaryColor} gradientWidth="50px">
        <h1 className="py-1 text-xs font-medium leading-tight">&nbsp;-&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;</h1>
      </Marquee>
    </div>
  )
}
