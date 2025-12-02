const toId = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "-");

export default toId;
