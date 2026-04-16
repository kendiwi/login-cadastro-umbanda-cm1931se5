import React, { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Camera, Upload, Image as ImageIcon } from 'lucide-react'
import { Medium } from '@/hooks/use-mediuns'

interface MediumFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<Medium, 'id' | 'grupo_id'>) => void
  initialData: Medium | null
}

export function MediumFormModal({ isOpen, onClose, onSave, initialData }: MediumFormModalProps) {
  const [nome, setNome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [contato, setContato] = useState('')
  const [foto, setFoto] = useState('')

  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen) {
      setNome(initialData?.nome || '')
      setDataNascimento(initialData?.data_nascimento || '')
      setContato(initialData?.contato || '')
      setFoto(initialData?.foto || '')
      setIsCameraOpen(false)
    } else {
      stopCamera()
    }
  }, [isOpen, initialData])

  const handleSave = () => {
    if (!nome.trim()) return
    onSave({ nome, data_nascimento: dataNascimento, contato, foto })
  }

  const startCamera = async () => {
    setIsCameraOpen(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Erro ao acessar a câmera', err)
      alert('Não foi possível acessar a câmera do dispositivo. Verifique as permissões.')
      setIsCameraOpen(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight)
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const startX = (videoRef.current.videoWidth - size) / 2
        const startY = (videoRef.current.videoHeight - size) / 2
        ctx.drawImage(videoRef.current, startX, startY, size, size, 0, 0, size, size)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setFoto(dataUrl)
        stopCamera()
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[425px] border-t-4 border-t-amber-500 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-purple-900">
            {initialData ? 'Editar Médium' : 'Adicionar Médium'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do médium para o registro do terreiro.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 py-2">
          <div className="flex flex-col items-center gap-3">
            {isCameraOpen ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-black flex items-center justify-center border-4 border-amber-200 shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="object-cover w-full h-full transform scale-x-[-1]"
                />
              </div>
            ) : (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-100 bg-purple-50 flex items-center justify-center shadow-sm">
                {foto ? (
                  <img src={foto} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-purple-300">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-[10px] uppercase font-semibold tracking-wider">
                      Sem Foto
                    </span>
                  </div>
                )}
              </div>
            )}

            {isCameraOpen ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-6 shadow-sm"
                >
                  Capturar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={stopCamera}
                  className="rounded-full"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={startCamera}
                  className="text-purple-700 border-purple-200 hover:bg-purple-50 shadow-sm"
                >
                  <Camera className="w-4 h-4 mr-2" /> Câmera
                </Button>
                <div className="relative shadow-sm">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-purple-700 border-purple-200 hover:bg-purple-50"
                  >
                    <Upload className="w-4 h-4 mr-2" /> Upload
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Fazer upload de foto"
                  />
                </div>
              </div>
            )}
            {foto && !isCameraOpen && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFoto('')}
                className="text-red-500 hover:text-red-700 h-6 text-xs mt-[-4px]"
              >
                Remover Foto
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-purple-900 font-medium">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João da Silva"
                className="border-purple-200 focus-visible:ring-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dataNascimento" className="text-purple-900 font-medium">
                Data de Nascimento
              </Label>
              <Input
                id="dataNascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="border-purple-200 focus-visible:ring-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contato" className="text-purple-900 font-medium">
                Telefone / Email
              </Label>
              <Input
                id="contato"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                placeholder="Ex: (11) 99999-9999"
                className="border-purple-200 focus-visible:ring-purple-500"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto text-muted-foreground hover:bg-purple-50 hover:text-purple-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white shadow-md"
            disabled={!nome.trim()}
          >
            {initialData ? 'Salvar Alterações' : 'Cadastrar Médium'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
