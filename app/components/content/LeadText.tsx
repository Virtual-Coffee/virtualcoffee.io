type LeadTextProps = {
	children: React.ReactNode;
};

export default function LeadText({ children }: LeadTextProps) {
	return <div className="lead">{children}</div>;
}
