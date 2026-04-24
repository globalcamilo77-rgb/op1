'use client'

import { useState } from 'react'
import { AdminTopbar } from '@/components/admin/topbar'
import { DataTable } from '@/components/admin/data-table'
import { categories } from '@/lib/mock-data'

export default function CategoriasPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Adding category:', { name, description })
    setName('')
    setDescription('')
  }

  const categoryColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome' },
    { key: 'productCount', label: 'Produtos' },
    {
      key: 'actions',
      label: 'Acoes',
      render: () => (
        <button className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-muted transition-colors">
          Editar
        </button>
      ),
    },
  ]

  return (
    <>
      <AdminTopbar title="Categorias" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-6 text-foreground">Adicionar Categoria</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Nome
              </label>
              <input
                type="text"
                id="name"
                placeholder="Ex: Cimentos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] focus:ring-2 focus:ring-[var(--orange-primary)]/10 bg-background text-foreground"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Descricao
              </label>
              <input
                type="text"
                id="description"
                placeholder="Descricao"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-[var(--orange-primary)] focus:ring-2 focus:ring-[var(--orange-primary)]/10 bg-background text-foreground"
              />
            </div>
          </form>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-[var(--orange-primary)] text-white rounded text-sm font-semibold hover:bg-[var(--orange-dark)] transition-colors"
          >
            Salvar Categoria
          </button>
        </div>

        <DataTable title="Categorias" columns={categoryColumns} data={categories} />
      </div>
    </>
  )
}
