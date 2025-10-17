import Link from "next/link";

export default function Home() {
    return (
        <div style={{display: "flex", gap:"12px"}}>
            <span>Hello Worlds</span>
            <Link href="https://google.com.tr">Google</Link>
        </div>
    );
}
