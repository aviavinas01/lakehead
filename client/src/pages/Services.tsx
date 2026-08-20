interface Service {
  key: string;
  title: string;
  desc: string;
}

const services: Service[] = [
  { key: "study-abroad", title: "Study Abroad Counselling", desc: "University and course selection, application support." },
  { key: "test-preparation", title: "Test Preparation", desc: "IELTS, PTE, TOEFL, SAT coaching." },
  { key: "visa-guidance", title: "Visa Guidance", desc: "Documentation, SOP review, interview preparation." },
  { key: "career-counselling", title: "Career Counselling", desc: "Aligning study plans with long-term career goals." },
];

export default function Services() {
  return (
    <section className="section container">
      <h1>Our Services</h1>
      <div className="grid grid-2">
        {services.map((s) => (
          <div className="card" key={s.key}>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
