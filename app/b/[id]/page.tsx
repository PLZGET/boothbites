import BoothApp from "@/components/booth-app";
export default async function BoothPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <BoothApp boothId={id}/>; }
