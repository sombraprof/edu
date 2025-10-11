# Bloco `modelViewer`

O bloco `modelViewer` permite incorporar modelos 3D interativos em aulas MD3 utilizando o web component [`@google/model-viewer`](https://modelviewer.dev/). Ele suporta renderização no navegador, controles de câmera e experiências de realidade aumentada (AR) quando arquivos USDZ são fornecidos.

## Formatos suportados

| Propósito              | Formato                 | Observações                                                          |
| ---------------------- | ----------------------- | -------------------------------------------------------------------- |
| Modelo principal       | `.glb`, `.gltf`         | Utilize versões com texturas incorporadas para simplificar o deploy. |
| Pré-visualização       | `.png`, `.jpg`, `.webp` | Opcional, usado no atributo `poster`.                                |
| AR em iOS              | `.usdz`                 | Necessário para habilitar `quick-look`.                              |
| Ambiente de iluminação | `.hdr`, `.exr`          | Opcional; melhora iluminação realista.                               |

## Diretrizes de produção

1. **Tamanho máximo**: mantenha cada arquivo `.glb`/`.gltf` abaixo de **5 MB**. O tempo de carregamento cresce rapidamente acima desse limite, especialmente em conexões móveis.
2. **Compressão**: utilize [`gltfpack`](https://github.com/zeux/meshoptimizer/tree/master/gltf) ou o pipeline de compressão do Blender para reduzir polígonos, texturas e aplicar meshopt/Draco.
3. **Texturas**: prefira texturas 2K (2048×2048) ou menores. Considere conversão para WebP ou KTX2 quando possível.
4. **Topologia**: limite o número de vértices (< 50 k) e evite animações pesadas; o componente atual prioriza visualizações estáticas.
5. **Organização**: armazene arquivos 3D em `src/content/**/assets/models/` ou `src/assets/models/`. Referencie-os via caminhos relativos (`content/.../modelo.glb`).
6. **Nomenclatura**: use nomes descritivos com letras minúsculas e hífens (`satellite-lowpoly.glb`). Os arquivos USDZ devem repetir o nome do GLB correspondente.

## Propriedades do bloco

| Campo                         | Tipo               | Descrição                                                                                     |
| ----------------------------- | ------------------ | --------------------------------------------------------------------------------------------- |
| `src`                         | `string`           | Caminho ou URL do modelo `.glb/.gltf` (obrigatório).                                          |
| `poster`                      | `string`           | Imagem exibida como placeholder antes do carregamento.                                        |
| `iosSrc`                      | `string`           | Arquivo `.usdz` para habilitar AR em iOS.                                                     |
| `alt`                         | `string`           | Texto alternativo para leitores de tela.                                                      |
| `autoRotate`                  | `boolean`          | Ativa rotação automática (respeita `prefers-reduced-motion`).                                 |
| `autoRotateDelay`             | `number`           | Tempo (ms) antes de iniciar a rotação automática.                                             |
| `cameraControls`              | `boolean`          | Habilita/desabilita controle do usuário (padrão: `true`).                                     |
| `ar`                          | `boolean`          | Exibe botão de AR. Com `true`, configure `arModes` e opcionalmente `iosSrc`.                  |
| `arModes`                     | `string[]`         | Modos de AR (`webxr`, `scene-viewer`, `quick-look`).                                          |
| `zoom`                        | `object`           | Ajusta limites de zoom `{ min, max, initial, disable }` (aceita números em graus ou strings). |
| `environmentImage`            | `string`           | HDR/EXR para iluminação personalizada.                                                        |
| `cameraOrbit`/`cameraTarget`  | `string`           | Define posição inicial e foco (`"45deg 75deg 2.5m"`).                                         |
| `height`/`aspectRatio`        | `string \| number` | Controla dimensões do canvas.                                                                 |
| `loadingLabel` / `errorLabel` | `string`           | Mensagens customizadas para estados de carregamento/erro.                                     |

A validação do esquema (`schemas/lesson.schema.json`) garante que apenas formatos suportados sejam utilizados e exige `arModes` quando `ar` estiver ativado.

## Exemplo de bloco JSON

```json
{
  "type": "modelViewer",
  "title": "Satélite geoestacionário",
  "description": "<p>Explore a antena e os painéis solares no modo 3D.</p>",
  "src": "content/courses/space/assets/models/satellite.glb",
  "poster": "content/courses/space/assets/images/satellite-poster.jpg",
  "alt": "Modelo 3D de um satélite com painéis abertos",
  "autoRotate": true,
  "autoRotateDelay": 1500,
  "cameraOrbit": "45deg 70deg 3.2m",
  "zoom": { "min": 30, "max": 70, "initial": 45 },
  "ar": true,
  "arModes": ["webxr", "scene-viewer"],
  "iosSrc": "content/courses/space/assets/models/satellite.usdz",
  "loadingLabel": "Carregando satélite..."
}
```

## Boas práticas adicionais

- **Fallback de acessibilidade**: forneça `alt` objetivo e use `footnote` para contextualizar limitações (ex.: “A visualização 3D requer WebGL”).
- **Storybook**: adicione exemplos cobrindo cenários com/sem AR e com zoom bloqueado para facilitar QA visual.
- **Testes de build**: execute `npm run build` ao adicionar modelos pesados para garantir que os assets sejam copiados e referenciados corretamente.

Siga estas orientações para manter tempos de carregamento aceitáveis e garantir uma experiência consistente entre dispositivos.
