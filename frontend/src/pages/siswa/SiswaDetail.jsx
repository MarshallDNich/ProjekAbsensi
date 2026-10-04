import { ArrowLeft, GraduationCap, User, Edit } from "lucide-react";

function SiswaDetail({ user, kelas, onClose, onEdit }) {
    const siswa = user.siswa;

    return (
        <div className="guru-page">
            <div className="page-header-bar">
                <button className="u-btn-cancel" onClick={onClose} style={{ padding: '0.5rem 1rem' }}>
                    <ArrowLeft size={20} />
                </button>
                <h2 style={{ margin: 0 }}>Detail Akademik Siswa</h2>
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
                            <div className="guru-avatar-placeholder" style={{ margin: '0 auto 1rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                                <User size={50} />
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

                        {siswa && (
                            <button
                                className="btn-action btn-edit"
                                onClick={() => onEdit(user)}
                                style={{ width: '100%', marginTop: '1rem' }}
                            >
                                <Edit size={16} />
                                Pindah Kelas
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {siswa ? (
                        <>
                            <div className="guru-card">
                                <div className="guru-card-body">
                                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <GraduationCap size={20} style={{ color: '#3b82f6' }} />
                                        Informasi Kelas
                                    </h4>
                                    
                                    {siswa.kelas ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '10px', border: '1px solid #dbeafe' }}>
                                                <p style={{ fontSize: '0.75rem', color: '#3b82f6', margin: '0 0 0.25rem 0', fontWeight: '600' }}>Nama Kelas</p>
                                                <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e40af', margin: 0 }}>
                                                    {siswa.kelas.nama_kelas}
                                                </p>
                                            </div>
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>Tingkat</p>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155', margin: 0 }}>
                                                        {siswa.kelas.tingkat}
                                                    </p>
                                                </div>
                                                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0 0 0.25rem 0' }}>Jurusan</p>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155', margin: 0 }}>
                                                        {siswa.kelas.jurusan}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0, fontStyle: 'italic' }}>
                                            Siswa belum ditempatkan di kelas manapun.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="guru-card">
                            <div className="guru-card-body">
                                <div className="warning-badge">
                                    <span>Siswa ini belum ditempatkan di kelas</span>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '1rem 0 0 0' }}>
                                    Silakan klik tombol "Tempatkan ke Kelas" untuk memilih kelas bagi siswa ini.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SiswaDetail;
