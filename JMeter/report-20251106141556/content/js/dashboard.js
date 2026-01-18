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

    var data = {"OkPercent": 99.78230247150724, "KoPercent": 0.21769752849276475};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.45441056078591896, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.05473856209150327, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.434850863422292, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.015909090909090907, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8547400611620795, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8536036036036037, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.006172839506172839, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.003105590062111801, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6804733727810651, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.1736474694589878, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.40238450074515647, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.5356576862123613, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.6507352941176471, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5587797619047619, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.8315868263473054, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0064516129032258064, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6704035874439462, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7809, 17, 0.21769752849276475, 1090.111666026379, 175, 25328, 735.0, 2109.0, 2992.5, 6273.099999999989, 4.334153283277905, 1648.5806123016564, 20.636189121907982], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 612, 0, 0.0, 2821.601307189546, 1217, 25328, 2195.5, 4586.500000000002, 6101.400000000005, 12570.880000000001, 0.36814023014779745, 138.28186269764228, 2.1964670032888995], "isController": false}, {"data": ["4.1 Vaccination questions", 637, 0, 0.0, 1227.2354788069076, 402, 7920, 971.0, 1801.0000000000011, 2731.2000000000007, 5712.600000000002, 0.3712112559178184, 136.2037687057038, 2.0981037877461244], "isController": false}, {"data": ["2.0 Register attendance", 660, 17, 2.5757575757575757, 4359.018181818179, 1197, 21502, 3744.5, 6938.799999999999, 8425.249999999998, 16312.92, 0.3747659841950963, 688.7735222881423, 7.8470016050701865], "isController": true}, {"data": ["1.0 Login", 672, 0, 0.0, 3757.77380952381, 1641, 18667, 3224.5, 5676.100000000002, 6567.900000000001, 11574.959999999972, 0.3750050223886927, 584.8557360047303, 7.087064019167946], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 153, 0, 0.0, 5071.111111111111, 1625, 27642, 4064.0, 8107.599999999999, 11625.499999999996, 24422.520000000048, 0.09107289224291105, 100.35208306268167, 1.5130933977435947], "isController": true}, {"data": ["2.5 Select patient", 654, 0, 0.0, 568.2094801223247, 223, 12464, 346.0, 910.5, 1348.0, 4596.300000000014, 0.3731324123695106, 139.40119638075822, 1.5339611337876533], "isController": false}, {"data": ["2.3 Search by first/last name", 666, 0, 0.0, 532.7102102102102, 230, 8174, 359.5, 801.0000000000007, 1253.1499999999992, 4121.890000000014, 0.3772152902462094, 143.40496491572128, 1.6126060962252984], "isController": false}, {"data": ["4.0 Vaccination for flu", 162, 0, 0.0, 4733.901234567902, 1324, 20359, 3995.5, 7381.0, 10536.149999999998, 19177.12000000001, 0.09515424091291683, 104.97294792372125, 1.5788371975548885], "isController": true}, {"data": ["4.0 Vaccination for hpv", 161, 0, 0.0, 4670.267080745341, 1445, 14487, 4248.0, 7063.000000000002, 8501.800000000001, 14134.219999999998, 0.09607185458659565, 104.77012363638384, 1.592647509270039], "isController": true}, {"data": ["1.2 Sign-in page", 676, 0, 0.0, 791.3520710059178, 175, 8258, 539.0, 1370.9, 1698.0499999999997, 4515.820000000021, 0.3762227238525207, 141.25958344429398, 1.814685598885635], "isController": false}, {"data": ["2.4 Patient attending session", 573, 17, 2.966841186736475, 2233.205933682369, 259, 18987, 1757.0, 3584.6000000000013, 5063.399999999998, 11322.879999999994, 0.40074245757934773, 150.68228870342506, 2.0130425376666436], "isController": false}, {"data": ["1.4 Open Sessions list", 671, 0, 0.0, 1237.549925484352, 648, 10042, 1061.0, 1887.4000000000015, 2267.7999999999993, 3693.6799999999985, 0.37568579454186213, 162.14589520840343, 1.5429059483420835], "isController": false}, {"data": ["4.2 Vaccination batch", 631, 0, 0.0, 908.2773375594296, 321, 14747, 622.0, 1363.2000000000003, 2066.5999999999995, 7899.799999999965, 0.3699308915158607, 136.7464554274314, 1.9020807614171462], "isController": false}, {"data": ["1.1 Homepage", 680, 0, 0.0, 766.7352941176476, 319, 9963, 576.5, 1195.3999999999996, 1690.0999999999988, 4346.759999999964, 0.3775445391513687, 141.1824133464146, 1.8088087734133134], "isController": false}, {"data": ["1.3 Sign-in", 672, 0, 0.0, 967.3869047619049, 315, 11009, 762.0, 1496.1000000000006, 2111.1000000000013, 5681.389999999987, 0.3752751738719128, 142.25297519096733, 1.9463200398478573], "isController": false}, {"data": ["2.2 Session register", 668, 0, 0.0, 578.7155688622747, 228, 8152, 417.5, 851.6000000000001, 1237.5999999999985, 4430.919999999949, 0.37733333785229545, 148.16539250469407, 1.5570328943020406], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 155, 0, 0.0, 5025.567741935484, 1240, 20171, 4175.0, 7973.0, 10694.999999999998, 17537.31999999999, 0.09233934889440013, 102.68799344304986, 1.5270811809204863], "isController": true}, {"data": ["2.1 Open session", 669, 0, 0.0, 749.7354260089685, 258, 6035, 552.0, 1196.0, 1698.5, 4219.999999999991, 0.3760734113287477, 138.1387228016078, 1.5485316342947473], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, 100.0, 0.21769752849276475], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7809, 17, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 573, 17, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
