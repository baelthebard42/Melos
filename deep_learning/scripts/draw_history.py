import torch
import matplotlib.pyplot as plt

# Lists to store epoch numbers and corresponding losses
epochs = list(range(5, 51, 5))
avg_losses = []
val_losses = []

# Load losses from checkpoints
for i in epochs:
    checkpoint = torch.load(f'checkpoint_{i}.pth')
    avg_losses.append(checkpoint['avg_loss'])
    val_losses.append(checkpoint['avg_vloss'])

# Plot the losses
plt.figure(figsize=(8, 5))
plt.plot(epochs, avg_losses, marker='o', label='Avg Training Loss')
plt.plot(epochs, val_losses, marker='s', label='Avg Validation Loss')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.title('Training and Validation Loss Over Epochs')
plt.legend()
plt.grid()
plt.show()
