import { ArrowLeft, BookOpen, GraduationCap, Edit } from "lucide-react";

function GuruDetail({ user, onClose, onEdit }) {
    const guru = user.guru;

    return (
        <div className="guru-page">
            <div className="page-header-bar">
                <button className="u-btn-cancel" onClick={onClose} style={{ padding: '0.5rem 1rem' }}>
                    <ArrowLeft size={20} />
                </button>
                <h2 style={{ margin: 0 }}>Detail Penugasan Guru</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="guru-card">
                    <div className="guru-card-body" style={{ textAlign: 'center' }}>
                        {user.foto ? (
                            <img
                                src={user.foto}
                                alt={user.nama}
                                className="guru-avatar"
                                style={{ marginBottom: '1rem' }}
                            />
                        ) : (
                            <div className="guru-avatar-placeholder" style={{ margin: '0 auto 1rem' }}>
                                <BookOpen size={50} />
                            </div>
                        )}

                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                            {user.nama}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                            {user.email}
                        </p>
                        <span className={`status-badge ${user.status === 'Aktif' ? 'aktif' : 'nonaktif'}`}>
                            {user.status}
                        </span>

                        {guru && (
                            <button
                                className="btn-action btn-edit"
                                onClick={() => onEdit(user)}
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                <Edit size={16} />
                                Edit Penugasan
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {guru ? (
                        <>
                            <div className="guru-card">
                                <div className="guru-card-body">
                                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <BookOpen size={20} className="text-success" />
                                        Mata Pelajaran
                                    </h4>
                                    {guru.mata_pelajaran && guru.mata_pelajaran.length > 0 ? (
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {guru.mata_pelajaran.map((mp, index) => (
                                                <li key={index} style={{ fontSize: '0.875rem', color: '#334155', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                                                    • {mp}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0, fontStyle: 'italic' }}>
                                            Belum ada mata pelajaran.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="guru-card">
                                <div className="guru-card-body">
                                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <GraduationCap size={20} className="text-info" />
                                        Kelas yang Diampu ({guru.kelas?.length || 0})
                                    </h4>
                                    {guru.kelas && guru.kelas.length > 0 ? (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {guru.kelas.map((k) => (
                                                <span key={k.id} style={{ 
                                                    padding: '0.5rem 1rem', 
                                                    background: '#eff6ff', 
                                                    color: '#3b82f6', 
                                                    borderRadius: '8px', 
                                                    fontSize: '0.875rem', 
                                                    fontWeight: '600',
                                                    border: '1px solid #dbeafe'
                                                }}>
                                                    {k.nama_kelas}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0, fontStyle: 'italic' }}>
                                            Belum mengampu kelas.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="guru-card">
                                <div className="guru-card-body">
                                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0' }}>
                                        📊 Statistik
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '10px', border: '1px solid #fde68a' }}>
                                            <p style={{ fontSize: '0.75rem', color: '#92400e', margin: '0 0 0.25rem 0', fontWeight: '600' }}>Total Mata Pelajaran</p>
                                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#92400e', margin: 0 }}>
                                                {guru.mata_pelajaran?.length || 0}
                                            </p>
                                        </div>
                                        <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                                            <p style={{ fontSize: '0.75rem', color: '#1e40af', margin: '0 0 0.25rem 0', fontWeight: '600' }}>Total Kelas</p>
                                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af', margin: 0 }}>
                                                {guru.kelas?.length || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="guru-card">
                            <div className="guru-card-body">
                                <div className="warning-badge">
                                    <span>Guru ini belum memiliki penugasan</span>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '1rem 0 0 0' }}>
                                    Silakan klik tombol "Atur Penugasan" untuk menambahkan mata pelajaran dan kelas yang diampu.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GuruDetail;
