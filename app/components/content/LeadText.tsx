type LeadTextProps = {
	children: React.ReactNode;
};

export default function LeadText({ children }: LeadTextProps): JSX.Element {
	return <div className="lead">{children}</div>;
}
