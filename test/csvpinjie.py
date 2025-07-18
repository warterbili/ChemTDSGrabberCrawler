
import os
import pandas as pd

def merge_csv_files(input_folder, output_file):
    """
    递归合并指定文件夹及其子文件夹中的所有CSV文件
    :param input_folder: 包含CSV文件的根目录路径
    :param output_file: 合并后的输出文件路径
    """
    dfs = []
    csv_count = 0
    
    # 使用os.walk递归遍历所有子文件夹
    for root, _, files in os.walk(input_folder):
        for file in files:
            if file.endswith('.csv'):
                file_path = os.path.join(root, file)
                try:
                    df = pd.read_csv(file_path)
                    dfs.append(df)
                    csv_count += 1
                    print(f"已加载: {file_path} (行数: {len(df)})")
                except Exception as e:
                    print(f"加载失败 {file_path}: {str(e)}")
    
    if not dfs:
        raise ValueError("未找到任何CSV文件")
    
    merged_df = pd.concat(dfs, ignore_index=True)
    merged_df.to_csv(output_file, index=False)
    print(f"成功合并{csv_count}个CSV文件到{output_file}")

if __name__ == "__main__":
    input_folder = "D:/new project/data/other_data"
    output_file = "D:/new project/data/output_data_txt/merged1.csv"
    merge_csv_files(input_folder, output_file)
