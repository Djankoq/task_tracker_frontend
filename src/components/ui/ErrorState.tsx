import { Button } from './Button'
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="error-state" role="alert"><h2>Не удалось загрузить данные</h2><p>{message}</p>{retry && <Button variant="secondary" onClick={retry}>Повторить</Button>}</div>
}
