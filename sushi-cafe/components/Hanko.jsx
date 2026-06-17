export default function Hanko({ char = '鮨', rotate = -4, 
    size = 56}) {
    return (
        <div
            aria-hidden="true"
            className="
            relative
            inline-flex
            w-14 h-14
            items-center justify-center

            rounded-md
            bg-red
            text-cream-fg

            font-jp
            font-bold
            leading-none
            text-[22.4px]

            shadow-sm
            rotate-[-4deg]

            after:absolute
            after:inset-[3px]
            after:rounded-[3px]
            after:border-[1.5px]
            after:border-[rgba(255,248,231,0.4)]
            after:content-['']"
    
            style={{
                width: size,
                height: size,
                fontSize: size * 0.4,
                transform: `rotate(${rotate}deg)`,
            }}
    >
        {char}
    </div>
    )
}

