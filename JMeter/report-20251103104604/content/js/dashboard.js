/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.78603741288666, "KoPercent": 0.21396258711333904};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.46096220265602955, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.058351568198395334, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4538517441860465, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.020938628158844765, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [3.4698126301179735E-4, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8898916967509025, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8881673881673882, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6977793199167245, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.23523093447905477, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.2701388888888889, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.5473415877640204, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.6814712005551701, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6054823039555864, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.8441558441558441, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6409516943042538, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 16358, 35, 0.21396258711333904, 990.0537963076162, 178, 24884, 665.0, 1863.0, 2354.0, 4736.049999999999, 4.54345095070003, 1710.2929728240429, 18.88968640557424], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1371, 0, 0.0, 2455.3406272793522, 1194, 24884, 1927.0, 3594.0, 4743.2, 11897.839999999997, 0.39774004743289404, 145.78970680361041, 2.0630943277257594], "isController": false}, {"data": ["4.1 Vaccination questions", 1376, 0, 0.0, 1180.8997093023256, 412, 13833, 996.0, 1455.6999999999996, 1854.2999999999997, 5171.960000000001, 0.3924488953675914, 142.8844864462348, 1.9572864471759794], "isController": false}, {"data": ["2.0 Register attendance", 1385, 35, 2.527075812274368, 3368.521299638988, 1145, 28970, 3073.0, 4896.200000000001, 6203.000000000002, 12405.680000000026, 0.3903353530252117, 687.2108709989922, 6.765495267659433], "isController": true}, {"data": ["1.0 Login", 1441, 0, 0.0, 3790.708535739068, 1232, 21695, 3499.0, 4848.0, 5587.9, 9992.479999999989, 0.4015593096969746, 616.3363518518719, 6.651418506606919], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 329, 0, 0.0, 4428.373860182373, 2734, 27003, 3787.0, 5593.0, 8576.0, 19644.6, 0.10724930312401898, 117.68254242948684, 1.572413467802716], "isController": true}, {"data": ["2.5 Select patient", 1385, 0, 0.0, 450.36245487364585, 238, 9255, 336.0, 667.4000000000005, 961.2000000000003, 2115.120000000001, 0.39011666882615725, 145.52829373514177, 1.3866176889213908], "isController": false}, {"data": ["2.3 Search by first/last name", 1386, 0, 0.0, 438.3037518037516, 235, 5896, 356.5, 620.8999999999999, 907.1999999999989, 1624.5099999999968, 0.388314153434521, 146.8242888743162, 1.443741748149134], "isController": false}, {"data": ["4.0 Vaccination for flu", 330, 0, 0.0, 4444.981818181824, 2600, 19554, 3770.5, 6002.600000000007, 8098.449999999995, 18048.899999999998, 0.10699455851613461, 119.82828699391575, 1.565314686397328], "isController": true}, {"data": ["4.0 Vaccination for hpv", 381, 0, 0.0, 4198.5091863517055, 1550, 26410, 3528.0, 5725.8, 7700.299999999999, 18463.70000000002, 0.10935203894195444, 116.08651110041589, 1.599480140568315], "isController": true}, {"data": ["1.2 Sign-in page", 1441, 0, 0.0, 725.8646773074261, 178, 11506, 535.0, 1174.8, 1519.3999999999978, 2748.6399999999885, 0.40174145581513093, 148.37052911472045, 1.7148425781960053], "isController": false}, {"data": ["2.4 Patient attending session", 931, 35, 3.7593984962406015, 1926.1825993555303, 379, 24004, 1495.0, 2798.0, 3928.9999999999995, 10780.439999999962, 0.2623390954006969, 99.35238591120005, 1.1419451775572145], "isController": false}, {"data": ["1.4 Open Sessions list", 1440, 0, 0.0, 1557.0263888888921, 632, 9308, 1468.0, 2109.9, 2373.2000000000007, 3267.3099999999995, 0.40211377809351156, 171.36096106309947, 1.4287697896177014], "isController": false}, {"data": ["4.2 Vaccination batch", 1373, 0, 0.0, 782.3058994901686, 348, 10374, 625.0, 1007.0000000000007, 1462.3999999999992, 5471.599999999998, 0.39425575396603196, 144.48315504468255, 1.7650252150136783], "isController": false}, {"data": ["1.1 Homepage", 1441, 0, 0.0, 687.6287300485759, 334, 13599, 546.0, 952.8, 1287.0999999999988, 3309.639999999985, 0.4016484029528544, 147.97990574476023, 1.706467852797672], "isController": false}, {"data": ["1.3 Sign-in", 1441, 0, 0.0, 821.2692574600982, 332, 10400, 723.0, 1229.8, 1481.299999999999, 2793.7599999999984, 0.4017855898106505, 149.16409883427113, 1.806471941839375], "isController": false}, {"data": ["2.2 Session register", 1386, 0, 0.0, 484.8744588744588, 236, 7684, 407.0, 676.3, 873.6499999999999, 1906.7599999999584, 0.3881641850484533, 149.94719312537003, 1.3863132417408688], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 333, 0, 0.0, 4621.780780780779, 2635, 26829, 3752.0, 6632.8000000000075, 9786.400000000001, 19784.700000000066, 0.10872251695565198, 120.95262039835212, 1.5937918397017086], "isController": true}, {"data": ["2.1 Open session", 1387, 0, 0.0, 700.1009372746933, 266, 8209, 586.0, 1073.0, 1348.199999999999, 2625.959999999988, 0.38738601857665383, 142.59032545793315, 1.3801303336100244], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 35, 100.0, 0.21396258711333904], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 16358, 35, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 35, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 931, 35, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 35, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
