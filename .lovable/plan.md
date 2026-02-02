
# Plano: Zoom Fluido com Ctrl+Scroll no Gráfico Expandido

## Objectivo

Substituir a interação actual por um sistema de zoom fluido e suave, onde o utilizador pode:
- **Ctrl + Scroll para cima**: Aproximar (zoom in) de forma suave
- **Ctrl + Scroll para baixo**: Afastar (zoom out) de forma suave
- Animações fluidas em todas as transições

## Abordagem Técnica

O Recharts não suporta nativamente zoom fluido com animações CSS. A solução é criar uma camada de gestão de estado que:
1. Captura eventos de wheel quando Ctrl está pressionado
2. Calcula os novos índices de forma incremental
3. Aplica transições suaves via CSS transitions e requestAnimationFrame

```text
INTERAÇÃO PRETENDIDA:

┌────────────────────────────────────────────────┐
│  Ctrl + 🖱️⬆️ Scroll Up = Zoom In (aproximar)   │
│  ┌──────────────────────────────────────────┐  │
│  │ ▓   ▓   ▓   ▓   ▓   ▓   ▓   ▓   ▓   ▓    │  │
│  │ Dados ampliam suavemente                 │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  Ctrl + 🖱️⬇️ Scroll Down = Zoom Out (afastar)  │
│  ┌──────────────────────────────────────────┐  │
│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │
│  │ Mostra mais dados suavemente             │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

## Implementação

### Ficheiro: `src/components/financial/GraficoLinhaMovimentos.tsx`

### 1. Adicionar Estado para Zoom Fluido

```typescript
// Nível de zoom: 1 = vista completa, valores maiores = mais zoom
const [zoomLevel, setZoomLevel] = useState(1);
const [zoomCenter, setZoomCenter] = useState(0.5); // Centro do zoom (0-1)
const MIN_ZOOM = 1;
const MAX_ZOOM = 10;
const ZOOM_SPEED = 0.15; // Velocidade do zoom
```

### 2. Handler para Wheel Event com Ctrl

```typescript
const handleWheel = useCallback((event: WheelEvent) => {
  // Só funciona com Ctrl pressionado
  if (!event.ctrlKey) return;
  
  event.preventDefault();
  
  // Determinar direcção do scroll
  const delta = event.deltaY > 0 ? -1 : 1; // Scroll up = zoom in
  
  setZoomLevel(prev => {
    const newZoom = prev + (delta * ZOOM_SPEED);
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
  });
}, []);
```

### 3. Cálculo de Índices Baseado no Zoom

```typescript
const getVisibleRange = useMemo(() => {
  const totalPoints = dados.length;
  
  // Quantos pontos mostrar baseado no nível de zoom
  const visiblePoints = Math.max(3, Math.floor(totalPoints / zoomLevel));
  
  // Calcular início e fim baseado no centro
  const centerIndex = Math.floor(totalPoints * zoomCenter);
  const halfVisible = Math.floor(visiblePoints / 2);
  
  let start = Math.max(0, centerIndex - halfVisible);
  let end = Math.min(totalPoints - 1, start + visiblePoints - 1);
  
  // Ajustar se passar dos limites
  if (end >= totalPoints - 1) {
    end = totalPoints - 1;
    start = Math.max(0, end - visiblePoints + 1);
  }
  
  return { start, end };
}, [dados.length, zoomLevel, zoomCenter]);
```

### 4. Aplicar CSS Transitions para Suavidade

```typescript
// Adicionar classe CSS para transições suaves
const chartContainerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const container = chartContainerRef.current;
  if (!container) return;
  
  container.addEventListener('wheel', handleWheel, { passive: false });
  
  return () => {
    container.removeEventListener('wheel', handleWheel);
  };
}, [handleWheel]);
```

### 5. Container com Cursor Indicativo

```typescript
<div 
  ref={chartContainerRef}
  className="relative cursor-zoom-in transition-all duration-300 ease-out"
  style={{
    // Mudar cursor quando Ctrl está pressionado
    cursor: isCtrlPressed ? (zoomLevel < MAX_ZOOM ? 'zoom-in' : 'zoom-out') : 'default'
  }}
>
  <ChartContent visibleRange={getVisibleRange} />
</div>
```

### 6. Actualizar ChartContent para Usar Slice de Dados

```typescript
const ChartContent = ({ height, visibleRange }: { height: number; visibleRange: { start: number; end: number } }) => {
  // Filtrar dados para o range visível
  const visibleData = dados.slice(visibleRange.start, visibleRange.end + 1);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart 
        data={visibleData} 
        margin={{ top: 30, right: 30, left: 20, bottom: 40 }}
        // Animação suave nativa do Recharts
        isAnimationActive={true}
        animationDuration={300}
        animationEasing="ease-out"
      >
        {/* ... restante do gráfico ... */}
      </BarChart>
    </ResponsiveContainer>
  );
};
```

### 7. Indicador Visual de Zoom

```typescript
// Mostrar nível de zoom actual
{zoomLevel > 1 && (
  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-muted-foreground border">
    🔍 {Math.round(zoomLevel * 100)}%
  </div>
)}
```

### 8. Detectar Tecla Ctrl Pressionada

```typescript
const [isCtrlPressed, setIsCtrlPressed] = useState(false);

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Control') setIsCtrlPressed(true);
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Control') setIsCtrlPressed(false);
  };
  
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, []);
```

### 9. Tooltip de Instrução

```typescript
// No modal expandido, mostrar dica de uso
<p className="text-xs text-muted-foreground mb-2">
  💡 Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> + scroll para zoom suave
</p>
```

## Comportamento Final

| Acção | Resultado |
|-------|-----------|
| `Ctrl + Scroll ⬆️` | Aproxima suavemente, mostra menos pontos com mais detalhe |
| `Ctrl + Scroll ⬇️` | Afasta suavemente, mostra mais pontos |
| `Ctrl + Scroll` (no limite) | Para suavemente sem saltar |
| Soltar `Ctrl` | Scroll normal da página volta a funcionar |
| Duplo-clique | Reset para vista inicial |

## Animação CSS

```css
/* Transições suaves para o gráfico */
.chart-zoom-container {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animação do indicador de zoom */
.zoom-indicator {
  animation: fadeIn 200ms ease-out;
}
```

## Resultado Esperado

- Zoom fluido e suave ao usar Ctrl+scroll
- Animações nativas do Recharts (300ms ease-out)
- Indicador visual do nível de zoom actual
- Cursor muda para indicar possibilidade de zoom
- Comportamento intuitivo e responsivo
- Mantém a barra Brush para navegação alternativa
